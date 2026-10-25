// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const VERSION = 'V.1.57.1';

const CONFIG = {
    coursePath: '../Cours/',
    maxDepth: 5,
    supportedFormats: { 
        glb: '🤖', // Android
        usdz: '🍎' // iOS
    },
    githubUser: 'Garibobo',         // Détecté automatiquement sur github.io (valeur par défaut pour les tests locaux)
    githubRepo: 'PWA-garibobo-RA',  // Détecté automatiquement sur github.io
    githubBranch: 'main'
};

// Arborescence de Cours/ : une seule requête à l'API GitHub (limite : 60 requêtes / heure / adresse IP,
// partagée par toute la classe sur le réseau de l'école) → mise en cache 1 h sur l'appareil
const TREE_CACHE_KEY = 'garibobo_tree_cache';
const TREE_CACHE_TTL = 60 * 60 * 1000;

// Menu Feller (gammes) et dossier principal Enseignement (anciens cours)
const FELLER_PATH = `${CONFIG.coursePath}01-FELLER/`;
const TEACHING_PATH = `${CONFIG.coursePath}Enseignement/`;

const state = {
    fileTree: [],
    fellerTree: [],
    menuMode: 'main', // 'main' (tous les cours) ou 'feller' (gammes Feller)
    currentModel: null,
    expandedFolders: new Set(),
    loadedFolders: new Map(),
    isIOS: false,
    isAndroid: false,
    knownUsdz: new Set(), // URLs des .usdz compagnons détectés
    arPlacement: localStorage.getItem('ar_placement') || 'floor',
    arMode: localStorage.getItem('ar_mode') || 'native', // Android : 'native' (Scene Viewer) ou 'web' (WebXR)
    annotations: new Map(), // Annotations par modèle
    annotationMode: false,
    annotationsVisible: true,
    pendingAnnotation: null,
    currentVariant: null, // Couleur choisie (conservée lors du basculement annotations)
    dimensionsVisible: false, // 📏 Cotes affichées (conservé au changement de modèle)
    lighting: localStorage.getItem('lighting') || 'studio', // 💡 Ambiance d'éclairage
    gestures: loadGestureOptions() // 👆 Rotation auto / déplacement / zoom
};

// Détecter la plateforme
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    state.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    state.isAndroid = /android/i.test(userAgent);
    
    const platform = state.isIOS ? 'iOS' : state.isAndroid ? 'Android' : 'Desktop';
    
    console.log(`📱 Plateforme détectée: ${platform}`);
    
    // Samsung Internet : touch-action="pan-y" laisse le navigateur intercepter le pincement → zoom 3D inopérant
    if (/SamsungBrowser/i.test(userAgent)) {
        document.getElementById('modelViewer')?.setAttribute('touch-action', 'none');
        console.log('📱 Samsung Internet : touch-action="none" pour le zoom à deux doigts');
    }
    
    // Afficher le message dans l'interface
    const platformInfo = document.getElementById('platformInfo');
    if (platformInfo) {
        if (state.isIOS) {
            platformInfo.innerHTML = '<strong>🍎 iOS détecté</strong> - Réalité augmentée via Quick Look (conversion automatique du modèle)';
        } else if (state.isAndroid) {
            platformInfo.innerHTML = '<strong>🤖 Android détecté</strong> - Réalité augmentée via Scene Viewer ou WebXR (⚙️ Options → Mode RA)';
        } else {
            platformInfo.innerHTML = '<strong>💻 Desktop détecté</strong> - Viewer 3D interactif (RA disponible sur mobile)';
        }
    }
}

// Retourne l'URL du .usdz compagnon d'un .glb (même nom, même dossier) ou null
function getCompanionUsdz(glbUrl) {
    if (!glbUrl || !glbUrl.toLowerCase().endsWith('.glb')) return null;
    const usdzUrl = glbUrl.replace(/\.glb$/i, '.usdz');
    return state.knownUsdz.has(usdzUrl) ? usdzUrl : null;
}

// Applique src (.glb) et ios-src (.usdz compagnon si présent) au viewer
function applyModelSources(viewer, glbUrl, usdzUrl = null) {
    viewer.src = glbUrl;
    applyArModes(viewer);
    const companion = usdzUrl || getCompanionUsdz(glbUrl);
    updateIosSource(viewer, companion);
}

// Mode RA Android : « native » = Scene Viewer en priorité (pourcentage de taille, pincement sur tous les navigateurs) ;
// « web » = WebXR en priorité (options visibles en RA). Scene Viewer ne lit pas les fichiers locaux (blob:) → WebXR.
function applyArModes(viewer) {
    const src = viewer.getAttribute('src') || '';
    const modes = src.startsWith('blob:') ? 'webxr quick-look'
        : state.arMode === 'web' ? 'webxr scene-viewer quick-look'
        : 'scene-viewer webxr quick-look';
    viewer.setAttribute('ar-modes', modes);
}

// ios-src : .usdz manuel seulement pour la couleur par défaut (il ne contient pas les variantes) ;
// sinon model-viewer génère le USDZ à la volée avec la couleur affichée
function updateIosSource(viewer, companion = getCompanionUsdz(viewer.src)) {
    const variants = viewer.availableVariants || [];
    const isDefaultVariant = !state.currentVariant || state.currentVariant === variants[0];
    if (companion && isDefaultVariant) {
        viewer.setAttribute('ios-src', companion);
        console.log(`🍎 USDZ compagnon utilisé: ${companion}`);
    } else {
        viewer.removeAttribute('ios-src');
    }
}

// Listes de pastilles : sous le viewer + bandeau visible en RA WebXR (DOM overlay)
const VARIANT_LISTS = ['variantList', 'arVariantList'];

// Met en évidence la pastille active dans toutes les listes
function highlightVariant(name) {
    VARIANT_LISTS.forEach(id => document.getElementById(id).querySelectorAll('.variant-btn').forEach(btn => {
        const isActive = btn.dataset.variant === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    }));
}

// Message Android : en mode RA natif, Scene Viewer affiche la couleur par défaut
function updateVariantInfo() {
    const variants = document.getElementById('modelViewer').availableVariants || [];
    const isDefault = !state.currentVariant || state.currentVariant === variants[0];
    document.getElementById('variantInfo').hidden = !(state.isAndroid && state.arMode !== 'web' && !isDefault);
}

// Sélecteur de couleurs : reconstruit à chaque chargement de modèle
function setupVariantSelector(viewer) {
    const variants = viewer.availableVariants || [];
    
    VARIANT_LISTS.forEach(id => document.getElementById(id).innerHTML = '');
    document.getElementById('variantSelector').hidden = variants.length === 0;
    document.getElementById('arVariants').hidden = variants.length === 0;
    if (variants.length === 0) {
        state.currentVariant = null;
        updateVariantInfo();
        return;
    }
    
    // Conserver la couleur choisie si elle existe encore (ex. bascule annotations), sinon couleur par défaut
    if (!variants.includes(state.currentVariant)) state.currentVariant = null;
    
    const selectVariant = (name) => {
        state.currentVariant = name;
        viewer.variantName = name;
        highlightVariant(name);
        updateVariantInfo();
        updateIosSource(viewer);
    };
    
    VARIANT_LISTS.forEach(id => {
        const list = document.getElementById(id);
        variants.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'variant-btn';
            btn.dataset.variant = name;
            btn.textContent = name;
            btn.onclick = () => selectVariant(name);
            list.appendChild(btn);
        });
    });
    
    if (state.currentVariant) {
        selectVariant(state.currentVariant);
    } else {
        // Couleur par défaut du fichier : pas de variantName appliqué, première pastille active
        highlightVariant(variants[0]);
        updateVariantInfo();
    }
    console.log(`🎨 ${variants.length} couleur(s) disponible(s):`, variants);
}

// Masque le sélecteur de couleurs et oublie la couleur choisie (changement de modèle)
function resetVariantSelector() {
    state.currentVariant = null;
    document.getElementById('modelViewer').variantName = null;
    document.getElementById('variantSelector').hidden = true;
    document.getElementById('arVariants').hidden = true;
    VARIANT_LISTS.forEach(id => document.getElementById(id).innerHTML = '');
}

// Dossiers fabricants de Cours/ (nom sans numéro, en majuscules) → titulaire des droits affiché sous le viewer
const BRAND_OWNERS = {
    'FELLER': 'Feller SA',
    'HAGER': 'Hager Group',
    'LEGRAND': 'Legrand',
    'ABB': 'ABB',
    'SCHNEIDER ELECTRIC': 'Schneider Electric',
    'EATON': 'Eaton',
    'WAGO': 'WAGO',
    'AGRO': 'Agro (groupe Kaiser)',
    'KAISER': 'Kaiser',
    'WOERTZ': 'Woertz',
    'PLICA': 'Plica',
    'OBO BETTERMANN': 'OBO Bettermann',
    'LANZ OENS': 'Lanz Oensingen',
    'THEBEN': 'Theben',
    'ZÜBLIN': 'Züblin',
    'B.E.G': 'B.E.G.',
    'TULUX': 'Tulux',
    'REGENT': 'Regent',
    'ZUMTOBEL': 'Zumtobel'
};

function brandDisclaimerText(owner) {
    return `Modèles 3D originaux © ${owner}. Utilisés à des fins strictement pédagogiques et non lucratives pour l'enseignement technique.`;
}

// Titulaire des droits d'un modèle selon son dossier fabricant (anciens modèles Enseignement/Feller compris), sinon null
function getBrandOwner(path) {
    const decoded = decodeURIComponent(path || '').normalize('NFC');
    if (/Cours\/Enseignement\/Feller\//i.test(decoded)) return BRAND_OWNERS.FELLER;
    const match = decoded.match(/Cours\/(?:\d+-)?([^/]+)\//);
    return match ? BRAND_OWNERS[match[1].toUpperCase()] || null : null;
}

// Mention de droits sous le viewer pour les modèles des dossiers fabricants
function updateModelDisclaimer(path) {
    const owner = getBrandOwner(path);
    const disclaimer = document.getElementById('modelDisclaimer');
    disclaimer.hidden = !owner;
    if (owner) disclaimer.textContent = brandDisclaimerText(owner);
}

// ===========================
// COTES DU MODÈLE (📏 Dimensions) — inspiré de l'exemple « Dimensions » de modelviewer.dev
// ===========================

// Coins de la boîte englobante (facteurs appliqués aux demi-dimensions)
const DIM_CORNERS = {
    '+X-Y+Z': [1, -1, 1], '+X-Y-Z': [1, -1, -1], '+X+Y-Z': [1, 1, -1],
    '-X+Y-Z': [-1, 1, -1], '-X-Y-Z': [-1, -1, -1], '-X-Y+Z': [-1, -1, 1]
};
// Étiquettes au milieu des arêtes (légèrement décalées vers l'extérieur) et axe mesuré
const DIM_LABELS = {
    '+X-Y': { pos: [1.2, -1.1, 0], axis: 'z' },
    '+X-Z': { pos: [1.2, 0, -1.2], axis: 'y' },
    '+Y-Z': { pos: [0, 1.1, -1.1], axis: 'x' },
    '-X-Z': { pos: [-1.2, 0, -1.2], axis: 'y' },
    '-X-Y': { pos: [-1.2, -1.1, 0], axis: 'z' }
};
// Lignes de cote : coin, coin, étiquette liée (ligne masquée quand l'étiquette ne fait pas face à la caméra)
const DIM_LINES = [
    ['+X-Y+Z', '+X-Y-Z', '+X-Y'],
    ['+X-Y-Z', '+X+Y-Z', '+X-Z'],
    ['+X+Y-Z', '-X+Y-Z', null],
    ['-X+Y-Z', '-X-Y-Z', '-X-Z'],
    ['-X-Y-Z', '-X-Y+Z', '-X-Y']
];
let dimFrame = null;

// Mètres → « 88 mm » (entier si ≥ 10 mm, sinon 1 décimale)
function formatMm(meters) {
    const mm = meters * 1000;
    return `${mm >= 10 ? Math.round(mm) : (Math.round(mm * 10) / 10).toLocaleString('fr-CH')} mm`;
}

// Place les hotspots et écrit les cotes du modèle chargé
function updateDimensions() {
    const viewer = document.getElementById('modelViewer');
    if (!viewer.loaded) return;
    const c = viewer.getBoundingBoxCenter();
    const s = viewer.getDimensions();
    const at = ([fx, fy, fz]) => `${c.x + fx * s.x / 2} ${c.y + fy * s.y / 2} ${c.z + fz * s.z / 2}`;
    
    Object.entries(DIM_CORNERS).forEach(([key, f]) => viewer.updateHotspot({ name: `hotspot-dim-c${key}`, position: at(f) }));
    Object.entries(DIM_LABELS).forEach(([key, { pos, axis }]) => {
        viewer.updateHotspot({ name: `hotspot-dim-l${key}`, position: at(pos) });
        viewer.querySelector(`[slot="hotspot-dim-l${key}"]`).textContent = formatMm(s[axis]);
    });
    document.getElementById('dim-summary').textContent = `📏 L ${formatMm(s.x)} × H ${formatMm(s.y)} × P ${formatMm(s.z)}`;
    document.getElementById('modelDims').textContent = `${formatMm(s.x)} × ${formatMm(s.y)} × ${formatMm(s.z)}`;
    renderDimLines();
    console.log(`📏 Dimensions: ${formatMm(s.x)} × ${formatMm(s.y)} × ${formatMm(s.z)}`);
}

// Lignes de cote SVG entre les coins projetés à l'écran
function renderDimLines() {
    const viewer = document.getElementById('modelViewer');
    const lines = document.querySelectorAll('#dim-lines line');
    DIM_LINES.forEach(([a, b, label], i) => {
        const p1 = viewer.queryHotspot(`hotspot-dim-c${a}`);
        const p2 = viewer.queryHotspot(`hotspot-dim-c${b}`);
        if (!p1 || !p2) return;
        lines[i].setAttribute('x1', p1.canvasPosition.x);
        lines[i].setAttribute('y1', p1.canvasPosition.y);
        lines[i].setAttribute('x2', p2.canvasPosition.x);
        lines[i].setAttribute('y2', p2.canvasPosition.y);
        const tie = label && viewer.queryHotspot(`hotspot-dim-l${label}`);
        lines[i].classList.toggle('dim-hide', !!tie && !tie.facingCamera);
    });
}

// Redessine les lignes à chaque image tant que les cotes sont affichées (rotation manuelle et auto-rotate)
function dimLoop() {
    renderDimLines();
    dimFrame = requestAnimationFrame(dimLoop);
}

// Interrupteur 📏 Dimensions (barre d'outils + menu mobile)
function setDimensionsVisible(visible) {
    state.dimensionsVisible = visible;
    document.getElementById('modelViewer').classList.toggle('dim-visible', visible);
    ['btnDimensions', 'btnDimensionsMobile', 'btnArDimensions'].forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.toggle('active', visible);
        btn.setAttribute('aria-pressed', visible);
    });
    cancelAnimationFrame(dimFrame);
    dimFrame = null;
    if (visible) {
        frameForDimensions();
        updateDimensions();
        dimLoop();
    }
}

// Recule un peu la caméra pour que les étiquettes de cotes (placées autour du modèle) restent visibles
function frameForDimensions() {
    const viewer = document.getElementById('modelViewer');
    if (viewer.loaded) viewer.cameraOrbit = 'auto auto 135%';
}

// ===========================
// ⚙️ OPTIONS : ÉCLAIRAGE, GESTES, MESURE ENTRE 2 POINTS, QUIZ
// ===========================

// 💡 Éclairage : 3 ambiances (clic = ambiance suivante), mémorisée sur l'appareil.
// « Réaliste » active aussi xr-environment : en RA WebXR (Android, mode Web), la lumière de la pièce est estimée.
const LIGHTING_PRESETS = {
    studio: { label: 'Studio', icon: '💡', environment: 'neutral', toneMapping: 'neutral', exposure: 0.9, shadowIntensity: 1, shadowSoftness: 0.5 },
    realiste: { label: 'Réaliste', icon: '🌤️', environment: 'legacy', toneMapping: 'aces', exposure: 1, shadowIntensity: 1.5, shadowSoftness: 0.2 },
    lumineux: { label: 'Lumineux', icon: '☀️', environment: 'neutral', toneMapping: 'agx', exposure: 1.4, shadowIntensity: 0.6, shadowSoftness: 1 }
};
const LIGHTING_ORDER = Object.keys(LIGHTING_PRESETS);

function applyLighting(name) {
    const viewer = document.getElementById('modelViewer');
    const preset = LIGHTING_PRESETS[name] || LIGHTING_PRESETS.studio;
    state.lighting = LIGHTING_PRESETS[name] ? name : 'studio';
    viewer.setAttribute('environment-image', preset.environment);
    viewer.setAttribute('tone-mapping', preset.toneMapping);
    viewer.setAttribute('exposure', preset.exposure);
    viewer.setAttribute('shadow-intensity', preset.shadowIntensity);
    viewer.setAttribute('shadow-softness', preset.shadowSoftness);
    viewer.toggleAttribute('xr-environment', state.lighting === 'realiste');
    document.getElementById('lightingLabel').textContent = `Éclairage : ${preset.label}`;
    document.getElementById('lightingIcon').textContent = preset.icon;
    localStorage.setItem('lighting', state.lighting);
}

// 👆 Gestes : rotation automatique, déplacement et zoom du modèle activables (mémorisés sur l'appareil)
function loadGestureOptions() {
    try {
        return { autoRotate: true, pan: true, zoom: true, ...JSON.parse(localStorage.getItem('gesture_options') || '{}') };
    } catch (e) {
        return { autoRotate: true, pan: true, zoom: true };
    }
}

function applyGestureOptions() {
    const viewer = document.getElementById('modelViewer');
    const opts = state.gestures;
    // Pendant une mesure, la rotation automatique est suspendue (on vise des points précis)
    viewer.toggleAttribute('auto-rotate', opts.autoRotate && !measure.active);
    viewer.toggleAttribute('disable-pan', !opts.pan);
    viewer.toggleAttribute('disable-zoom', !opts.zoom);
}

// 📍 Mesure entre 2 points : toucher / cliquer deux points du modèle → distance en mm (ligne + étiquette)
const measure = { active: false, points: [], frame: null };

function setMeasureText(text) {
    document.getElementById('mesText').textContent = text;
}

function setMeasureMode(active) {
    const viewer = document.getElementById('modelViewer');
    measure.active = active;
    measure.points = [];
    viewer.classList.toggle('mes-mode', active);
    viewer.classList.remove('mes-has-a', 'mes-has-b');
    document.getElementById('measureLabel').textContent = active ? 'Arrêter la mesure' : 'Mesurer entre 2 points';
    setMeasureText('📍 Touchez un 1er point du modèle');
    applyGestureOptions();
    cancelAnimationFrame(measure.frame);
    measure.frame = null;
}

function addMeasurePoint(clientX, clientY) {
    const viewer = document.getElementById('modelViewer');
    const hit = viewer.positionAndNormalFromPoint(clientX, clientY);
    if (!hit) {
        setMeasureText('⚠️ Touchez directement le modèle');
        return;
    }
    if (measure.points.length === 2) measure.points = [];
    const p = hit.position;
    measure.points.push({ x: p.x, y: p.y, z: p.z });
    const toPos = (pt) => `${pt.x} ${pt.y} ${pt.z}`;
    
    if (measure.points.length === 1) {
        viewer.updateHotspot({ name: 'hotspot-mes-a', position: toPos(measure.points[0]) });
        viewer.classList.add('mes-has-a');
        viewer.classList.remove('mes-has-b');
        cancelAnimationFrame(measure.frame);
        setMeasureText('📍 Touchez un 2e point');
        return;
    }
    const [a, b] = measure.points;
    const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    viewer.updateHotspot({ name: 'hotspot-mes-b', position: toPos(b) });
    viewer.updateHotspot({ name: 'hotspot-mes-l', position: toPos({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }) });
    viewer.querySelector('[slot="hotspot-mes-l"]').textContent = formatMm(distance);
    viewer.classList.add('mes-has-b');
    setMeasureText(`📏 Distance : ${formatMm(distance)} — touchez pour une nouvelle mesure`);
    console.log(`📍 Mesure : ${formatMm(distance)}`);
    const loop = () => {
        renderMeasureLine();
        measure.frame = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(measure.frame);
    loop();
}

// Ligne SVG entre les 2 points projetés à l'écran (suit la rotation du modèle)
function renderMeasureLine() {
    const viewer = document.getElementById('modelViewer');
    const a = viewer.queryHotspot('hotspot-mes-a');
    const b = viewer.queryHotspot('hotspot-mes-b');
    if (!a || !b) return;
    const line = document.getElementById('mes-line');
    line.setAttribute('x1', a.canvasPosition.x);
    line.setAttribute('y1', a.canvasPosition.y);
    line.setAttribute('x2', b.canvasPosition.x);
    line.setAttribute('y2', b.canvasPosition.y);
}

// 🎓 Quiz : fichier « <modèle>.quiz.json » préparé par l'enseignant (à côté du .glb),
// sinon quiz généré automatiquement à partir du modèle (cotes, couleurs, animation)
function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Question à choix multiple : la bonne réponse est mélangée avec les leurres
function makeQuestion(question, correct, distractors, explanation) {
    const choices = shuffle([correct, ...distractors.filter(d => d !== correct).slice(0, 3)]);
    return { question, choices, answer: choices.indexOf(correct), explanation };
}

function buildAutoQuiz(viewer) {
    const size = viewer.getDimensions();
    const questions = [];
    [['x', 'la longueur (L)'], ['y', 'la hauteur (H)'], ['z', 'la profondeur (P)']].forEach(([axis, label]) => {
        const meters = size[axis];
        if (meters * 1000 < 1) return;
        const correct = formatMm(meters);
        const distractors = [...new Set([0.5, 1.5, 2, 0.75, 3].map(f => formatMm(meters * f)))];
        questions.push(makeQuestion(`Quelle est ${label} de ce modèle ?`, correct, distractors,
            `Réponse : ${correct}. Astuce : le bouton 📏 Dimensions affiche les cotes sur le modèle.`));
    });
    
    const variants = viewer.availableVariants || [];
    if (variants.length >= 2) {
        const n = variants.length;
        questions.push(makeQuestion('Combien de couleurs sont proposées pour ce modèle ?', String(n),
            [n + 1, n + 3, Math.max(1, n - 2), n + 5].map(String),
            `Réponse : ${n} couleurs (${variants.join(', ')}).`));
        const fakes = shuffle(['Violet', 'Turquoise', 'Rose fuchsia', 'Orange', 'Bordeaux', 'Vert pomme', 'Doré', 'Bleu ciel'])
            .filter(c => !variants.some(v => v.toLowerCase() === c.toLowerCase()));
        const real = variants[Math.floor(Math.random() * n)];
        questions.push(makeQuestion('Laquelle de ces couleurs est disponible ?', real, fakes,
            `Réponse : ${real}. Le sélecteur 🎨 Couleur sous le lecteur montre toutes les couleurs.`));
    }
    
    const animated = (viewer.availableAnimations || []).length > 0;
    questions.push(makeQuestion('Ce modèle contient-il une animation ?', animated ? 'Oui' : 'Non', [animated ? 'Non' : 'Oui'],
        animated ? 'Oui : le bouton ⏸️ Pause permet de l\'arrêter.' : 'Non : ce modèle est statique.'));
    return questions;
}

// Accepte les clés françaises ou anglaises ; « reponse » = numéro (0 = 1er choix) ou texte du bon choix
function normalizeQuiz(data) {
    return (data?.questions || []).map(q => {
        const choices = (q.choix || q.choices || []).map(String);
        const raw = q.reponse ?? q.answer;
        const answer = typeof raw === 'number' ? raw : choices.indexOf(String(raw));
        return { question: String(q.question || ''), choices, answer, explanation: String(q.explication || q.explanation || '') };
    }).filter(q => q.question && q.choices.length >= 2 && q.answer >= 0 && q.answer < q.choices.length);
}

async function openQuiz() {
    const viewer = document.getElementById('modelViewer');
    const body = document.getElementById('quizBody');
    if (!state.currentModel || !viewer.loaded) {
        alert('⚠️ Aucun modèle chargé\n\nChoisissez d\'abord un modèle 3D dans le menu.');
        return;
    }
    document.getElementById('quizModal').style.display = 'flex';
    body.textContent = 'Chargement du quiz…';
    
    let questions = [];
    let fromTeacher = false;
    if (!state.currentModel.startsWith('blob:')) {
        try {
            const response = await fetch(state.currentModel.replace(/\.glb(\?.*)?$/i, '.quiz.json'));
            if (response.ok) {
                questions = normalizeQuiz(await response.json());
                fromTeacher = questions.length > 0;
            }
        } catch (e) {
            console.warn('⚠️ Quiz enseignant illisible, quiz automatique', e);
        }
    }
    if (!fromTeacher) questions = buildAutoQuiz(viewer);
    runQuiz(questions, fromTeacher);
}

function runQuiz(questions, fromTeacher) {
    const body = document.getElementById('quizBody');
    let index = 0;
    let score = 0;
    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    
    const showQuestion = () => {
        const q = questions[index];
        body.innerHTML = '';
        body.append(
            el('p', 'quiz-source', fromTeacher ? '👩‍🏫 Quiz préparé par l\'enseignant' : '🤖 Quiz généré à partir du modèle'),
            el('p', 'quiz-progress', `Question ${index + 1} / ${questions.length} — Score : ${score}`),
            el('h3', 'quiz-question', q.question)
        );
        const list = el('div', 'quiz-choices');
        const feedback = el('p', 'quiz-feedback');
        const next = el('button', 'btn-primary quiz-next', index + 1 < questions.length ? 'Question suivante ➡️' : 'Voir le résultat 🏁');
        next.hidden = true;
        q.choices.forEach((choice, i) => {
            const btn = el('button', 'quiz-choice', choice);
            btn.type = 'button';
            btn.onclick = () => {
                const good = i === q.answer;
                if (good) score++;
                list.querySelectorAll('button').forEach((b, j) => {
                    b.disabled = true;
                    b.classList.toggle('correct', j === q.answer);
                });
                if (!good) btn.classList.add('wrong');
                feedback.textContent = `${good ? '✅ Bonne réponse !' : '❌ Pas tout à fait.'} ${q.explanation}`;
                feedback.classList.toggle('good', good);
                next.hidden = false;
                next.focus();
            };
            list.appendChild(btn);
        });
        next.onclick = () => {
            index++;
            if (index < questions.length) showQuestion();
            else showResult();
        };
        body.append(list, feedback, next);
    };
    
    const showResult = () => {
        const ratio = score / questions.length;
        body.innerHTML = '';
        const again = el('button', 'btn-primary', '🔄 Recommencer');
        again.onclick = () => runQuiz(fromTeacher ? shuffle(questions) : buildAutoQuiz(document.getElementById('modelViewer')), fromTeacher);
        const close = el('button', 'btn-secondary', 'Fermer');
        close.onclick = () => { document.getElementById('quizModal').style.display = 'none'; };
        const actions = el('div', 'quiz-actions');
        actions.append(again, close);
        body.append(
            el('p', 'quiz-score', `${ratio === 1 ? '🏆' : ratio >= 0.5 ? '👍' : '📚'} Score : ${score} / ${questions.length}`),
            el('p', 'quiz-progress', ratio === 1 ? 'Parfait, bravo !' : ratio >= 0.5 ? 'Bien joué, encore un petit effort !' : 'Observe bien le modèle et réessaie.'),
            actions
        );
    };
    
    if (questions.length === 0) {
        body.textContent = 'Aucune question disponible pour ce modèle.';
        return;
    }
    showQuestion();
}

// RA WebXR : model-viewer n'expose pas l'échelle en RA. On lit son moteur RA interne
// (propriété symbole « renderer » → arRenderer : goalScale, presentedScene.scenePivot.scale), vérifié sur model-viewer 4.3.1.
// Si une future version change ces noms, la fonction renvoie null et les outils d'échelle sont masqués.
function getArRenderer(viewer) {
    for (let proto = viewer; proto; proto = Object.getPrototypeOf(proto)) {
        const sym = Object.getOwnPropertySymbols(proto).find(s => s.description === 'renderer');
        if (sym) {
            const ar = viewer[sym]?.arRenderer;
            return ar && 'goalScale' in ar ? ar : null;
        }
    }
    return null;
}

let arScaleTimer = null;

// Pourcentage de taille affiché en RA WebXR (100 % = taille réelle)
function updateArScale(ar) {
    const scale = ar?.presentedScene?.scenePivot?.scale?.x;
    if (typeof scale !== 'number') return;
    const percent = Math.round(scale * 100);
    const label = document.getElementById('arScale');
    label.textContent = percent === 100 ? '100 % réel' : `${percent} %`;
    label.classList.toggle('real', percent === 100);
}

// Début / fin de la RA WebXR : suivi de l'échelle toutes les 150 ms (le pincement modifie la taille)
function onArStatus(viewer, status) {
    clearInterval(arScaleTimer);
    arScaleTimer = null;
    if (status !== 'session-started' && status !== 'object-placed') return;
    const ar = getArRenderer(viewer);
    document.getElementById('arScale').hidden = !ar;
    document.getElementById('btnArRealSize').hidden = !ar;
    if (!ar) return;
    updateArScale(ar);
    arScaleTimer = setInterval(() => updateArScale(ar), 150);
}

// Bouton « 1:1 Taille réelle » : remet le modèle à 100 % (animation douce gérée par model-viewer)
function resetArRealSize(viewer) {
    const ar = getArRenderer(viewer);
    if (ar?.presentedScene) ar.goalScale = 1;
}

// Libellé du dossier d'un modèle (chemin relatif à Cours/) ou "Local"
function getFolderLabel(path) {
    if (!path || path.startsWith('blob:')) return 'Local';
    const match = decodeURIComponent(path).match(/Cours\/(.*)\/[^/]+$/);
    // Numéros d'ordre masqués comme dans le menu : « 01-FELLER/06-STANDARDdue » → « FELLER › STANDARDdue »
    return match ? match[1].split('/').map(s => s.replace(/^\d+-/, '')).join(' › ') : '-';
}

// Affiche les boutons Lecture/Pause (desktop + mobile) si le modèle est animé
function setupAnimationButtons(viewer) {
    const buttons = [document.getElementById('btnPlayPause'), document.getElementById('btnPlayPauseMobile')];
    viewer.addEventListener('load', () => {
        const animations = viewer.availableAnimations;
        const hasAnimations = animations && animations.length > 0;
        buttons.forEach(btn => btn.classList.toggle('no-animation', !hasAnimations));
        if (hasAnimations) console.log(`✅ ${animations.length} animation(s) détectée(s):`, animations);
    }, { once: true });
}

// Détecter automatiquement le repo GitHub depuis l'URL
function detectGitHubRepo() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('github.io')) {
        // Format: username.github.io/repo-name/
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
            // Garder la casse de la configuration si c'est le même dépôt (URLs identiques à celles des favoris)
            const user = hostname.split('.')[0];
            const repo = decodeURIComponent(parts[0]);
            if (user.toLowerCase() !== CONFIG.githubUser.toLowerCase()) CONFIG.githubUser = user;
            if (repo.toLowerCase() !== CONFIG.githubRepo.toLowerCase()) CONFIG.githubRepo = repo;
            console.log(`📦 Repo détecté: ${CONFIG.githubUser}/${CONFIG.githubRepo}`);
        }
    }
}

// URL d'un fichier du dépôt (chaque segment encodé comme le faisait l'API : espaces → %20, accents…)
function repoFileUrls(repoPath) {
    const encoded = repoPath.split('/').map(encodeURIComponent).join('/');
    const { githubUser: user, githubRepo: repo, githubBranch: branch } = CONFIG;
    return {
        download_url: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${encoded}`,
        html_url: `https://github.com/${user}/${repo}/blob/${branch}/${encoded}`
    };
}

// Charge (une seule fois par visite) la liste de tous les fichiers de Cours/ ; cache local 1 h,
// cache périmé réutilisé si GitHub refuse (limite atteinte, hors-ligne)
let repoTreePromise = null;
function loadRepoTree() {
    if (repoTreePromise) return repoTreePromise;
    repoTreePromise = (async () => {
        const repoId = `${CONFIG.githubUser}/${CONFIG.githubRepo}@${CONFIG.githubBranch}`.toLowerCase();
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(TREE_CACHE_KEY)); } catch (e) { /* cache illisible */ }
        if (cached?.repo !== repoId) cached = null;
        if (cached && Date.now() - cached.time < TREE_CACHE_TTL) return cached;
        
        try {
            const apiUrl = `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.githubRepo}/git/trees/${CONFIG.githubBranch}?recursive=1`;
            console.log(`🔍 Arborescence: ${apiUrl}`);
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const limited = response.status === 403 || response.status === 429;
                const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
                const minutes = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : null;
                throw new Error(limited
                    ? `Limite de GitHub atteinte (trop de consultations depuis ce réseau)${minutes ? ` : réessayez dans ${minutes} min` : ''}.`
                    : `GitHub a répondu ${response.status}.`);
            }
            const data = await response.json();
            const entries = data.tree
                .filter(e => e.path.startsWith('Cours/'))
                .map(e => [e.path, e.type === 'tree' ? 1 : 0]);
            if (entries.length === 0) throw new Error('Le dossier Cours/ est introuvable ou vide sur GitHub.');
            const tree = { repo: repoId, time: Date.now(), entries };
            try { localStorage.setItem(TREE_CACHE_KEY, JSON.stringify(tree)); } catch (e) { /* stockage plein */ }
            state.treeError = null;
            return tree;
        } catch (error) {
            console.warn('⚠️ Arborescence GitHub indisponible:', error);
            if (cached) {
                console.log('📦 Utilisation de la dernière liste enregistrée sur l\'appareil');
                return cached;
            }
            state.treeError = navigator.onLine === false ? 'Pas de connexion Internet.' : error.message;
            return null;
        }
    })();
    return repoTreePromise;
}

// Relance le chargement (bouton « Réessayer » du message d'erreur)
async function retryLoadTree() {
    repoTreePromise = null;
    state.treeError = null;
    state.loadedFolders.clear();
    state.expandedFolders.clear();
    document.getElementById('fileTree').innerHTML = '<div class="loading">Chargement des cours...</div>';
    state.fileTree = await scanDirectory();
    if (state.menuMode === 'feller') state.fellerTree = await scanDirectory(FELLER_PATH, 1);
    renderMenu();
}

// Contenu direct d'un dossier, au format de l'ancienne API « contents » (name, type, download_url, html_url)
function listRepoFolder(tree, path) {
    const prefix = path.replace(/^\.\.\//, '');
    return tree.entries
        .filter(([p]) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
        .map(([p, isDir]) => ({
            name: p.slice(prefix.length),
            type: isDir ? 'dir' : 'file',
            ...repoFileUrls(p)
        }));
}

// Scan d'un dossier (à partir de l'arborescence complète chargée une seule fois)
async function scanDirectory(path = CONFIG.coursePath, depth = 0) {
    if (depth >= CONFIG.maxDepth) return [];
    
    // Si on a déjà chargé ce dossier, retourner le cache
    if (state.loadedFolders.has(path)) {
        return state.loadedFolders.get(path);
    }
    
    const tree = await loadRepoTree();
    if (!tree) return [];
    const data = listRepoFolder(tree, path);
    const items = [];
    
    // Recenser les .usdz du dossier (compagnons optionnels des .glb)
    for (const item of data) {
        if (item.type === 'file' && item.name.toLowerCase().endsWith('.usdz')) {
            state.knownUsdz.add(item.download_url);
        }
    }
    
    for (const item of data) {
        if (item.type === 'dir') {
            items.push({
                type: 'folder',
                name: item.name,
                path: `${path}${item.name}/`,
                children: [],
                depth: depth,
                expanded: false
            });
            continue;
        }
        const ext = item.name.split('.').pop().toLowerCase();
        
        // Documents PDF : listés en tête du dossier
        if (ext === 'pdf') {
            items.push({
                type: 'pdf',
                name: item.name.replace(/\.pdf$/i, '').replace(/_/g, ' '),
                path: item.download_url,
                htmlUrl: item.html_url,
                depth: depth
            });
        }
        
        // Raccourcis Internet Windows (.url) : adresse lue juste après
        if (ext === 'url') {
            items.push({
                type: 'link',
                name: item.name.replace(/\.url$/i, ''),
                source: item.download_url,
                url: null,
                depth: depth
            });
        }
        
        // Un seul .glb pour toutes les plateformes ; les .usdz ne sont plus listés
        if (ext === 'glb') {
            items.push({
                type: 'file',
                // Préfixe d'ordre « 01- » masqué à l'affichage (l'ordre GitHub est conservé)
                name: item.name.replace(/\.glb$/i, '').replace(/^\d+-/, ''),
                format: ext,
                path: item.download_url,
                usdz: getCompanionUsdz(item.download_url),
                depth: depth
            });
        }
    }
    
    // Lire l'adresse de chaque raccourci .url (ligne « URL=... ») ; liens illisibles ignorés
    await Promise.all(items.filter(i => i.type === 'link').map(async (link) => {
        try {
            const text = await (await fetch(link.source)).text();
            link.url = (text.match(/^URL=(.+)$/mi) || [])[1]?.trim() || null;
        } catch (e) {
            console.warn(`⚠️ Lien illisible: ${link.name}`, e);
        }
    }));
    
    // Liens tout en haut, puis PDF, puis modèles, sous-dossiers à la fin (ordre GitHub conservé dans chaque groupe)
    const rank = (i) => ({ link: 0, pdf: 1, file: 2, folder: 3 })[i.type] ?? 2;
    const visibleItems = items
        .filter(i => i.type !== 'link' || /^https?:\/\//i.test(i.url || ''))
        .sort((a, b) => rank(a) - rank(b));
    state.loadedFolders.set(path, visibleItems);
    return visibleItems;
}

// Recherche dans tous les dossiers : modèles 3D et PDF dont le nom contient le texte (sans tenir compte des accents)
function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function searchRepo(tree, query) {
    const q = normalizeText(query);
    return tree.entries
        .filter(([p, isDir]) => !isDir && /\.(glb|pdf)$/i.test(p) && !/-annotated\.glb$/i.test(p))
        .map(([p]) => {
            const fileName = p.split('/').pop();
            const isPdf = /\.pdf$/i.test(p);
            const { download_url, html_url } = repoFileUrls(p);
            return {
                type: isPdf ? 'pdf' : 'file',
                name: isPdf ? fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ') : fileName.replace(/\.glb$/i, '').replace(/^\d+-/, ''),
                format: isPdf ? 'pdf' : 'glb',
                path: download_url,
                htmlUrl: html_url,
                usdz: isPdf ? null : getCompanionUsdz(download_url),
                folder: p.split('/').slice(1, -1).map(s => s.replace(/^\d+-/, '')).join(' › '),
                depth: 0
            };
        })
        .filter(item => normalizeText(`${item.name} ${item.folder}`).includes(q));
}

// Libellé affiché d'un dossier : le préfixe d'ordre « 01- » est masqué partout (« 03-LEGRAND » → « LEGRAND »)
function getDisplayName(item) {
    return item.name.replace(/^\d+-/, '');
}

// Icône d'un dossier : 🎓 pour le dossier principal Enseignement
function getFolderIcon(item) {
    return item.path === TEACHING_PATH ? '🎓' : '📁';
}

// Rendu du menu selon le mode (principal ou Feller)
async function renderMenu() {
    const fileTree = document.getElementById('fileTree');
    const isFeller = state.menuMode === 'feller';
    const query = (state.searchQuery || '').trim();
    document.getElementById('menuDisclaimer').hidden = !isFeller;
    
    // Recherche (≥ 2 caractères) : résultats de tous les dossiers
    if (query.length >= 2) {
        const tree = await loadRepoTree();
        if ((state.searchQuery || '').trim() !== query) return; // saisie modifiée entre-temps
        const results = tree ? searchRepo(tree, query) : [];
        fileTree.innerHTML = '';
        const title = document.createElement('h3');
        title.className = 'menu-section-title';
        title.textContent = `🔍 ${results.length} résultat${results.length > 1 ? 's' : ''}`;
        fileTree.appendChild(title);
        renderFileTree(results, fileTree);
        renderTreeError(fileTree);
        return;
    }
    
    fileTree.innerHTML = '';
    renderTreeError(fileTree);
    if (!isFeller) {
        renderFileTree(state.fileTree, fileTree);
        return;
    }
    
    // Logo Feller + titre « Design » puis les gammes dans l'ordre des préfixes
    const title = document.createElement('h3');
    title.className = 'menu-section-title';
    title.innerHTML = '<img src="icons/feller-logo.png" alt="Feller" class="tree-brand-logo"> Design';
    fileTree.appendChild(title);
    renderFileTree(state.fellerTree, fileTree, '', 1);
}

// Message si la liste des cours n'a pas pu être chargée depuis GitHub, avec bouton « Réessayer »
function renderTreeError(container) {
    if (!state.treeError) return;
    const box = document.createElement('div');
    box.className = 'tree-error';
    box.innerHTML = `<p>⚠️ Liste des cours indisponible.</p><p class="tree-error-detail"></p><button type="button" class="btn-secondary">🔄 Réessayer</button>`;
    box.querySelector('.tree-error-detail').textContent = state.treeError;
    box.querySelector('button').onclick = retryLoadTree;
    container.prepend(box);
}

// Retour à l'état initial du site (bouton « Retour à l'accueil », logo et titre Garibobo RA)
function goHome() {
    const viewer = document.getElementById('modelViewer');
    if (document.fullscreenElement) document.exitFullscreen?.();
    state.menuMode = 'main';
    state.searchQuery = '';
    document.getElementById('searchInput').value = '';
    state.expandedFolders.clear();
    state.currentModel = null;
    resetVariantSelector();
    setDimensionsVisible(false);
    setMeasureMode(false);
    viewer.removeAttribute('src');
    viewer.removeAttribute('ios-src');
    document.getElementById('modelDisclaimer').hidden = true;
    document.getElementById('modelDims').textContent = '-';
    document.getElementById('viewerContainer').classList.add('no-model');
    document.getElementById('sidebar').classList.remove('collapsed');
    document.getElementById('sidebar').scrollTop = 0;
    document.querySelector('.main-content').scrollTop = 0;
    renderMenu();
}

// Largeur du menu réglable avec la poignée entre le menu et le lecteur (souris, doigt ou flèches du clavier),
// mémorisée sur l'appareil ; double-clic = largeur par défaut
function setupSidebarResize() {
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('resizeHandle');
    const KEY = 'sidebar_width';
    const apply = (width) => {
        const max = Math.max(160, window.innerWidth * 0.7);
        sidebar.style.width = `${Math.round(Math.min(Math.max(width, 120), max))}px`;
    };
    const save = () => localStorage.setItem(KEY, parseInt(sidebar.style.width, 10));
    
    const saved = Number(localStorage.getItem(KEY));
    if (saved) apply(saved);
    
    handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        document.body.classList.add('resizing');
        const startX = e.clientX;
        const startWidth = sidebar.getBoundingClientRect().width;
        const move = (ev) => apply(startWidth + ev.clientX - startX);
        const end = () => {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', end);
            handle.removeEventListener('pointercancel', end);
            document.body.classList.remove('resizing');
            save();
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', end);
        handle.addEventListener('pointercancel', end);
    });
    handle.addEventListener('dblclick', () => {
        sidebar.style.width = '';
        localStorage.removeItem(KEY);
    });
    handle.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        apply(sidebar.getBoundingClientRect().width + (e.key === 'ArrowRight' ? 20 : -20));
        save();
    });
    // Rotation de l'écran / fenêtre réduite : la largeur choisie reste dans les limites
    window.addEventListener('resize', () => {
        if (sidebar.style.width) apply(parseInt(sidebar.style.width, 10));
    });
}

// Affiche le lecteur avec un modèle (masque l'accueil)
function showViewer() {
    document.getElementById('viewerContainer').classList.remove('no-model');
}

// Ouvre le menu Feller (clic sur le logo ou sur le dossier 01-FELLER)
async function openFellerMenu() {
    state.menuMode = 'feller';
    document.getElementById('fileTree').innerHTML = '<div class="loading">Chargement de Feller...</div>';
    state.fellerTree = await scanDirectory(FELLER_PATH, 1);
    renderMenu();
    document.getElementById('sidebar').scrollTop = 0;
}

// Libellé d'un fichier, avec le dossier d'origine en petit dans les résultats de recherche
function fileLabel(item) {
    return `<span class="tree-label">${item.name}${item.folder ? `<span class="tree-sub">${item.folder}</span>` : ''}</span>`;
}

// Rendu de l'arborescence (baseDepth : profondeur affichée sans retrait)
function renderFileTree(items, container, parentPath = '', baseDepth = 0) {
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        // Retrait par niveau réglé en CSS (--tree-indent : plus petit sur smartphone)
        div.style.paddingLeft = `calc(var(--tree-indent) * ${item.depth - baseDepth})`;
        
        if (item.type === 'folder') {
            const folder = document.createElement('div');
            folder.className = 'tree-folder';
            const isExpanded = state.expandedFolders.has(item.path);
            const toggleIcon = isExpanded ? '▼' : '▶';
            // Logo Feller en face du dossier 01-FELLER
            const brand = item.path === FELLER_PATH ? '<img src="icons/feller-logo.png" alt="Feller" class="tree-brand-logo">' : '';
            folder.innerHTML = `<span class="tree-toggle">${toggleIcon}</span><span class="tree-icon">${getFolderIcon(item)}</span><span class="tree-label">${getDisplayName(item)}</span>${brand}`;
            if (brand) folder.title = 'Ouvrir le catalogue Feller';
            
            folder.onclick = async (e) => {
                e.stopPropagation();
                // Le dossier Feller ouvre son menu dédié
                if (item.path === FELLER_PATH) return openFellerMenu();
                await toggleFolder(item, div);
            };
            
            div.appendChild(folder);
            container.appendChild(div);
            
            // Si le dossier est déjà ouvert, afficher ses enfants
            if (isExpanded && item.children.length > 0) {
                renderFileTree(item.children, container, item.path, baseDepth);
            }
        } else if (item.type === 'pdf') {
            const pdf = document.createElement('div');
            pdf.className = 'tree-file tree-pdf';
            pdf.title = 'Ouvrir le PDF dans un nouvel onglet';
            pdf.innerHTML = `<span class="tree-icon">📄</span>${fileLabel(item)}`;
            pdf.onclick = () => openPdf(item);
            div.appendChild(pdf);
            container.appendChild(div);
        } else if (item.type === 'link') {
            const isVideo = /youtube\.com|youtu\.be|vimeo\.com/i.test(item.url);
            const link = document.createElement('a');
            link.className = 'tree-file tree-link';
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.title = item.url;
            link.innerHTML = `<span class="tree-icon">${isVideo ? '▶️' : '🔗'}</span><span class="tree-label">${item.name}</span>`;
            div.appendChild(link);
            container.appendChild(div);
        } else {
            const file = document.createElement('div');
            file.className = 'tree-file';
            file.dataset.path = item.path;
            file.classList.toggle('active', item.path === state.currentModel);
            file.innerHTML = `<span class="tree-icon">${CONFIG.supportedFormats[item.format]}</span>${fileLabel(item)}`;
            file.onclick = () => loadModel(item);
            div.appendChild(file);
            container.appendChild(div);
        }
    });
}

// Ouvre un PDF dans la visionneuse du navigateur.
// GitHub (raw) l'envoie en application/octet-stream → téléchargement forcé ; on le re-type en application/pdf.
// L'onglet est ouvert immédiatement (avant le fetch) pour ne pas être bloqué comme pop-up.
// Android : pas de visionneuse PDF intégrée fiable → téléchargement, ouvert ensuite par l'application PDF du téléphone.
async function openPdf(item) {
    if (state.isAndroid) {
        window.open(item.path, '_blank');
        return;
    }
    const tab = window.open('', '_blank');
    if (tab) tab.document.title = item.name;
    try {
        const response = await fetch(item.path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = new Blob([await response.arrayBuffer()], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        if (tab) tab.location.href = url;
        else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        console.warn('⚠️ PDF : ouverture via GitHub', error);
        if (tab) tab.location.href = item.htmlUrl || item.path;
        else window.open(item.htmlUrl || item.path, '_blank');
    }
}

// Toggle dossier (ouvrir/fermer)
async function toggleFolder(folder, folderDiv) {
    const isExpanded = state.expandedFolders.has(folder.path);
    
    if (isExpanded) {
        // Fermer le dossier
        state.expandedFolders.delete(folder.path);
        folder.expanded = false;
    } else {
        // Ouvrir le dossier
        state.expandedFolders.add(folder.path);
        folder.expanded = true;
        
        // Charger les enfants si pas encore fait
        if (folder.children.length === 0) {
            folder.children = await scanDirectory(folder.path, folder.depth + 1);
        }
    }
    
    // Re-render du menu complet (principal ou Feller)
    renderMenu();
}

// Chargement d'un modèle 3D
function loadModel(item) {
    const viewer = document.getElementById('modelViewer');
    const btnAR = document.getElementById('btnAR');
    
    showViewer();
    
    // Définir le modèle actuel (important pour les annotations) et le mettre en évidence dans le menu
    state.currentModel = item.path;
    document.querySelectorAll('.tree-file[data-path]').forEach(el => el.classList.toggle('active', el.dataset.path === item.path));
    resetVariantSelector();
    updateModelDisclaimer(item.path);
    
    // Toujours charger le .glb ; ios-src seulement si un .usdz compagnon existe
    applyModelSources(viewer, item.path, item.usdz || null);
    
    // Configurer le bouton AR selon la plateforme
    btnAR.style.display = 'inline-block';
    if (!state.isIOS && !state.isAndroid) {
        // Sur desktop, désactiver le bouton avec un message
        btnAR.disabled = false; // Garder actif pour le message
        btnAR.title = 'AR disponible uniquement sur mobile (Android/iOS)';
    } else {
        btnAR.disabled = false;
        btnAR.title = 'Voir en réalité augmentée';
    }
    
    document.getElementById('modelTitle').textContent = item.name;
    document.getElementById('modelFile').textContent = item.name;
    document.getElementById('modelDims').textContent = '…'; // complété au chargement (updateDimensions)
    document.getElementById('modelFolder').textContent = getFolderLabel(item.path);
    
    // Détecter si le modèle a des animations
    setupAnimationButtons(viewer);
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Afficher la version
    console.log(`🚀 Garibobo RA ${VERSION} - Chargement...`);
    
    // Gestion du thème (mode sombre/clair)
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Appliquer le thème sauvegardé
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    
    // Appliquer le theme-color au chargement pour Samsung Internet
    const initialColor = savedTheme === 'dark' ? '#1565C0' : '#1976D2';
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const samsungThemeMeta = document.querySelector('meta[name="samsung-internet-theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', initialColor);
    if (samsungThemeMeta) samsungThemeMeta.setAttribute('content', initialColor);
    
    // Toggle du thème
    themeToggle.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        
        // Mise à jour meta theme-color pour Samsung Internet
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        const samsungThemeMeta = document.querySelector('meta[name="samsung-internet-theme-color"]');
        const newColor = newTheme === 'dark' ? '#1565C0' : '#1976D2';
        if (themeColorMeta) themeColorMeta.setAttribute('content', newColor);
        if (samsungThemeMeta) samsungThemeMeta.setAttribute('content', newColor);
    };
    
    // Détecter la plateforme
    detectPlatform();
    
    // Détecter Chrome sur iOS (problème de compatibilité avec model-viewer)
    const userAgent = navigator.userAgent;
    const isChromeIOS = /CriOS/i.test(userAgent) && /iPhone|iPad|iPod/i.test(userAgent);
    
    if (isChromeIOS) {
        // Afficher un avertissement pour Chrome iOS
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 90%;
            text-align: center;
            font-size: 14px;
        `;
        warning.innerHTML = `
            ⚠️ Pour une meilleure expérience 3D sur iPhone, utilisez <strong>Safari</strong><br>
            <small>(Le mode AR fonctionne correctement dans Chrome)</small>
        `;
        document.body.appendChild(warning);
        
        // Masquer après 8 secondes
        setTimeout(() => {
            warning.style.transition = 'opacity 0.5s';
            warning.style.opacity = '0';
            setTimeout(() => warning.remove(), 500);
        }, 8000);
    }
    
    // Détecter le repo GitHub
    detectGitHubRepo();
    
    // Liste des cours chargée en arrière-plan (les boutons restent utilisables pendant le chargement)
    scanDirectory().then(items => {
        state.fileTree = items;
        renderMenu();
    });
    
    setupSidebarResize();
    
    // Retour à l'état initial : bouton « Retour à l'accueil », logo et titre Garibobo RA
    document.getElementById('btnBackMain').onclick = goHome;
    document.getElementById('btnHome').onclick = (e) => {
        e.preventDefault();
        goHome();
    };
    
    // Gestion du menu déroulant
    const dropdown = document.querySelector('.dropdown');
    const btnOptions = document.getElementById('btnOptions');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    btnOptions.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    };
    
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Fermer le menu après avoir cliqué sur une option
    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    });
    
    // Bouton AR
    document.getElementById('btnAR').onclick = () => {
        if (!state.isIOS && !state.isAndroid) {
            alert('📱 La réalité augmentée est disponible uniquement sur mobile.\n\n✅ Android : Ouvrez cette PWA sur votre téléphone Android\n✅ iOS : Ouvrez cette PWA sur votre iPhone/iPad');
        } else {
            document.getElementById('modelViewer').activateAR();
        }
    };
    
    // Bouton Reset
    document.getElementById('btnReset').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        viewer.cameraOrbit = 'auto auto auto';
    };
    
    // Barre de progression du chargement des modèles
    const modelViewer = document.getElementById('modelViewer');
    
    // Couleurs disponibles : à chaque chargement (nouveau modèle ou bascule annotations)
    modelViewer.addEventListener('load', () => setupVariantSelector(modelViewer));
    
    // 📏 Cotes : recalculées à chaque chargement et changement de couleur ; affichées directement si le bouton est actif
    modelViewer.addEventListener('load', () => {
        if (state.dimensionsVisible) frameForDimensions();
        updateDimensions();
        // Nouveau modèle : la mesure en cours est effacée (le mode mesure reste actif)
        if (measure.active) setMeasureMode(true);
    });
    modelViewer.addEventListener('variant-applied', updateDimensions);
    document.getElementById('btnDimensions').onclick = () => setDimensionsVisible(!state.dimensionsVisible);
    document.getElementById('btnDimensionsMobile').onclick = () => setDimensionsVisible(!state.dimensionsVisible);
    
    // Outils RA WebXR (colonne de gauche) : Dimensions + Taille réelle ; un toucher ne doit pas déplacer le modèle
    document.getElementById('btnArDimensions').onclick = () => setDimensionsVisible(!state.dimensionsVisible);
    document.getElementById('btnArRealSize').onclick = () => resetArRealSize(modelViewer);
    document.getElementById('arTools').addEventListener('beforexrselect', (e) => e.preventDefault());
    modelViewer.addEventListener('ar-status', (e) => onArStatus(modelViewer, e.detail.status));
    const progressBar = modelViewer.querySelector('.progress-bar');
    const updateBar = modelViewer.querySelector('.update-bar');
    modelViewer.addEventListener('progress', (e) => {
        const progress = e.detail.totalProgress;
        updateBar.style.width = `${progress * 100}%`;
        progressBar.classList.toggle('hide', progress === 1);
    });
    
    // Placement RA : sol ou mur (persisté)
    function applyArPlacement() {
        const viewer = document.getElementById('modelViewer');
        const label = document.getElementById('placementLabel');
        const icon = document.getElementById('placementIcon');
        viewer.setAttribute('ar-placement', state.arPlacement);
        if (label) label.textContent = state.arPlacement === 'wall' ? 'Placement RA : Mur' : 'Placement RA : Sol';
        if (icon) icon.textContent = state.arPlacement === 'wall' ? '🧱' : '⬇️';
    }
    applyArPlacement();
    
    // Mode RA Android : Natif (Scene Viewer, pourcentage) ou Web (WebXR, couleurs en RA) — persisté, Android uniquement
    function applyArModeUI() {
        document.getElementById('arModeLabel').textContent = state.arMode === 'web' ? 'Mode RA : Web (couleurs en RA)' : 'Mode RA : Natif (pourcentage)';
        document.getElementById('arModeIcon').textContent = state.arMode === 'web' ? '🌐' : '📲';
        applyArModes(document.getElementById('modelViewer'));
        updateVariantInfo();
    }
    if (!state.isAndroid) document.getElementById('btnArMode').style.display = 'none';
    applyArModeUI();
    
    document.getElementById('btnArMode').onclick = () => {
        state.arMode = state.arMode === 'web' ? 'native' : 'web';
        localStorage.setItem('ar_mode', state.arMode);
        applyArModeUI();
        console.log(`🥽 Mode RA: ${state.arMode}`);
    };
    
    // Bandeau de couleurs en RA : un toucher sur les pastilles ne doit pas déplacer le modèle
    document.getElementById('arVariants').addEventListener('beforexrselect', (e) => e.preventDefault());
    
    document.getElementById('btnPlacement').onclick = () => {
        state.arPlacement = state.arPlacement === 'wall' ? 'floor' : 'wall';
        localStorage.setItem('ar_placement', state.arPlacement);
        applyArPlacement();
        console.log(`📍 Placement RA: ${state.arPlacement}`);
    };
    
    // Bouton Retourner (flip vertical 180°)
    let isFlipped = false;
    document.getElementById('btnFlip').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        const btn = document.getElementById('btnFlip');
        
        if (!isFlipped) {
            // Retourner : vue du dessous (180° vertical)
            viewer.cameraOrbit = '0deg -75deg 105%';
            btn.textContent = '🔃 Remettre';
            isFlipped = true;
        } else {
            // Remettre en position normale
            viewer.cameraOrbit = '0deg 75deg 105%';
            btn.textContent = '🔃 Retourner';
            isFlipped = false;
        }
    };
    
    // Bouton Plein écran
    document.getElementById('btnFullscreen').onclick = () => {
        const viewerContainer = document.getElementById('viewerContainer');
        const btn = document.getElementById('btnFullscreen');
        
        if (!document.fullscreenElement) {
            // Entrer en plein écran
            if (viewerContainer.requestFullscreen) {
                viewerContainer.requestFullscreen();
            } else if (viewerContainer.webkitRequestFullscreen) { // Safari
                viewerContainer.webkitRequestFullscreen();
            } else if (viewerContainer.msRequestFullscreen) { // IE11
                viewerContainer.msRequestFullscreen();
            }
        } else {
            // Sortir du plein écran
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
            }
        }
    };
    
    // Détecter les changements de plein écran pour mettre à jour le bouton
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('msfullscreenchange', updateFullscreenButton);
    
    function updateFullscreenButton() {
        const btn = document.getElementById('btnFullscreen');
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            btn.textContent = '⛶ Quitter plein écran';
        } else {
            btn.textContent = '⛶ Plein écran';
        }
    }
    
    // Bouton Play/Pause Animation (Desktop)
    let isPlaying = true;
    document.getElementById('btnPlayPause').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        const btn = document.getElementById('btnPlayPause');
        
        if (isPlaying) {
            viewer.pause();
            btn.textContent = '▶️ Lecture';
            isPlaying = false;
        } else {
            viewer.play();
            btn.textContent = '⏸️ Pause';
            isPlaying = true;
        }
    };
    
    // Boutons mobiles (dans le menu déroulant)
    document.getElementById('btnResetMobile').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        viewer.cameraOrbit = 'auto auto auto';
    };
    
    document.getElementById('btnFullscreenMobile').onclick = () => {
        const viewerContainer = document.getElementById('viewerContainer');
        
        if (!document.fullscreenElement) {
            if (viewerContainer.requestFullscreen) {
                viewerContainer.requestFullscreen();
            } else if (viewerContainer.webkitRequestFullscreen) {
                viewerContainer.webkitRequestFullscreen();
            } else if (viewerContainer.msRequestFullscreen) {
                viewerContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };
    
    document.getElementById('btnFlipMobile').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        const btn = document.getElementById('btnFlipMobile').querySelector('.text');
        
        if (!isFlipped) {
            viewer.cameraOrbit = '0deg -75deg 105%';
            btn.textContent = 'Remettre';
            isFlipped = true;
        } else {
            viewer.cameraOrbit = '0deg 75deg 105%';
            btn.textContent = 'Retourner';
            isFlipped = false;
        }
    };
    
    document.getElementById('btnPlayPauseMobile').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        const btn = document.getElementById('btnPlayPauseMobile').querySelector('.text');
        
        if (isPlaying) {
            viewer.pause();
            btn.textContent = 'Lecture';
            isPlaying = false;
        } else {
            viewer.play();
            btn.textContent = 'Pause';
            isPlaying = true;
        }
    };
    
    // Boutons visibles
    
    // 📸 Capture d'écran
    document.getElementById('btnScreenshot').onclick = async () => {
        const viewer = document.getElementById('modelViewer');
        const btn = document.getElementById('btnScreenshot');
        
        try {
            btn.textContent = '⏳ Capture...';
            btn.disabled = true;
            
            // Attendre un peu pour que le rendu soit stable
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Capturer l'image du model-viewer
            const blob = await viewer.toBlob({
                idealAspect: true,
                mimeType: 'image/png'
            });
            
            // Créer un lien de téléchargement
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const modelName = document.getElementById('modelTitle').textContent.replace(/[^a-z0-9]/gi, '_');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            link.href = url;
            link.download = `Garibobo_${modelName}_${timestamp}.png`;
            link.click();
            
            // Nettoyer
            URL.revokeObjectURL(url);
            
            btn.textContent = '✅ Capturé !';
            setTimeout(() => {
                btn.textContent = '📸 Capturer';
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Erreur capture:', error);
            btn.textContent = '❌ Erreur';
            setTimeout(() => {
                btn.textContent = '📸 Capturer';
                btn.disabled = false;
            }, 2000);
        }
    };
    
    // 🔍 Zoom
    document.getElementById('btnZoom').onclick = () => {
        document.getElementById('zoomModal').style.display = 'flex';
    };
    
    document.getElementById('closeZoomModal').onclick = () => {
        document.getElementById('zoomModal').style.display = 'none';
    };
    
    // Boutons de zoom prédéfinis
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.onclick = () => {
            const zoom = btn.dataset.zoom;
            const viewer = document.getElementById('modelViewer');
            viewer.cameraOrbit = `auto auto ${zoom}`;
            document.getElementById('zoomModal').style.display = 'none';
        };
    });
    
    // Slider de zoom
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomValue = document.getElementById('zoomValue');
    
    zoomSlider.oninput = () => {
        const value = zoomSlider.value;
        zoomValue.textContent = `${value}%`;
        const viewer = document.getElementById('modelViewer');
        viewer.cameraOrbit = `auto auto ${value}%`;
    };
    
    // ℹ️ Détails
    document.getElementById('btnDetails').onclick = () => {
        const modelName = document.getElementById('modelTitle').textContent;
        const modelFolder = document.getElementById('modelFolder').textContent;
        const modelDims = document.getElementById('modelDims').textContent;
        alert(`ℹ️ Détails du modèle\n\n📦 Nom: ${modelName}\n📁 Dossier: ${modelFolder}\n📏 Dimensions (L × H × P): ${modelDims}\n\nCliquez sur des parties du modèle pour plus d'informations (bientôt disponible).`);
    };
    
    // Options du menu déroulant
    
    // 📍 Mesure entre 2 points : un clic sans glisser pose un point (un glisser fait tourner le modèle)
    document.getElementById('btnMeasure').onclick = () => {
        if (!state.currentModel) {
            alert('⚠️ Aucun modèle chargé\n\nChoisissez d\'abord un modèle 3D dans le menu.');
            return;
        }
        setMeasureMode(!measure.active);
    };
    document.getElementById('btnMesClose').onclick = (e) => {
        e.stopPropagation();
        setMeasureMode(false);
    };
    let pointerStart = null;
    modelViewer.addEventListener('pointerdown', (e) => { pointerStart = { x: e.clientX, y: e.clientY }; });
    modelViewer.addEventListener('click', (e) => {
        if (!measure.active || e.target.closest('button, .mes-banner')) return;
        const moved = pointerStart && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 6;
        if (!moved) addMeasurePoint(e.clientX, e.clientY);
    });
    
    // 💡 Éclairage : Studio → Réaliste → Lumineux
    applyLighting(state.lighting);
    document.getElementById('btnLighting').onclick = () => {
        const next = LIGHTING_ORDER[(LIGHTING_ORDER.indexOf(state.lighting) + 1) % LIGHTING_ORDER.length];
        applyLighting(next);
        console.log(`💡 Éclairage : ${next}`);
    };
    
    // 👆 Gestes et commandes : guide + réglages
    const gestureInputs = { optAutoRotate: 'autoRotate', optPan: 'pan', optZoom: 'zoom' };
    applyGestureOptions();
    Object.entries(gestureInputs).forEach(([id, key]) => {
        const input = document.getElementById(id);
        input.checked = state.gestures[key];
        input.onchange = () => {
            state.gestures[key] = input.checked;
            localStorage.setItem('gesture_options', JSON.stringify(state.gestures));
            applyGestureOptions();
        };
    });
    document.getElementById('btnGestures').onclick = () => {
        document.getElementById('gesturesModal').style.display = 'flex';
    };
    document.getElementById('closeGesturesModal').onclick = () => {
        document.getElementById('gesturesModal').style.display = 'none';
    };
    
    // Fenêtres Gestes et Quiz : fermeture en cliquant à côté
    ['gesturesModal', 'quizModal'].forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target.id === id) e.target.style.display = 'none';
        });
    });
    
    // ⭐ Système de favoris
    document.getElementById('btnFavorites').onclick = () => {
        toggleFavorite();
    };
    
    document.getElementById('closeFavoritesModal').onclick = () => {
        document.getElementById('favoritesModal').style.display = 'none';
    };
    
    function getFavorites() {
        const favorites = localStorage.getItem('garibobo_favorites');
        return favorites ? JSON.parse(favorites) : [];
    }
    
    function saveFavorites(favorites) {
        localStorage.setItem('garibobo_favorites', JSON.stringify(favorites));
    }
    
    function toggleFavorite() {
        const modelName = document.getElementById('modelTitle').textContent;
        const modelPath = state.currentModel;
        const modelFormat = 'GLB';
        
        if (!modelPath) {
            alert('⚠️ Aucun modèle chargé\n\nVeuillez d\'abord charger un modèle 3D.');
            return;
        }
        if (modelPath.startsWith('blob:')) {
            alert('⚠️ Un fichier ouvert depuis votre appareil ne peut pas être ajouté aux favoris.');
            return;
        }
        
        const favorites = getFavorites();
        const existingIndex = favorites.findIndex(f => f.path === modelPath);
        
        if (existingIndex !== -1) {
            // Retirer des favoris
            favorites.splice(existingIndex, 1);
            saveFavorites(favorites);
            alert(`❌ Retiré des favoris\n\n"${modelName}" a été retiré de vos favoris.`);
        } else {
            // Ajouter aux favoris
            favorites.push({
                name: modelName,
                path: modelPath,
                format: modelFormat,
                addedAt: new Date().toISOString()
            });
            saveFavorites(favorites);
            alert(`⭐ Ajouté aux favoris !\n\n"${modelName}" a été ajouté à vos favoris.`);
        }
        
        updateFavoritesList();
    }
    
    function updateFavoritesList() {
        const favorites = getFavorites();
        const favoritesList = document.getElementById('favoritesList');
        const emptyState = document.getElementById('emptyFavorites');
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            favoritesList.innerHTML = favorites.map((fav, index) => `
                <div class="favorite-item" data-path="${fav.path}">
                    <div class="favorite-icon">📦</div>
                    <div class="favorite-info">
                        <div class="favorite-name">${fav.name}</div>
                        <div class="favorite-path">${getFolderLabel(fav.path)}</div>
                    </div>
                    <div class="favorite-actions">
                        <button class="btn-primary btn-load-favorite" data-index="${index}">📂 Charger</button>
                        <button class="btn-secondary btn-remove-favorite" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `).join('');
            
            // Ajouter les événements
            document.querySelectorAll('.btn-load-favorite').forEach(btn => {
                btn.onclick = () => {
                    const index = parseInt(btn.dataset.index);
                    const fav = favorites[index];
                    loadModel({ name: fav.name, path: fav.path, format: 'glb' });
                    document.getElementById('favoritesModal').style.display = 'none';
                };
            });
            
            document.querySelectorAll('.btn-remove-favorite').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    const fav = favorites[index];
                    if (confirm(`Retirer "${fav.name}" des favoris ?`)) {
                        favorites.splice(index, 1);
                        saveFavorites(favorites);
                        updateFavoritesList();
                    }
                };
            });
        }
    }
    
    // Ouvrir la modale des favoris depuis le menu
    const originalBtnFavorites = document.getElementById('btnFavorites');
    originalBtnFavorites.onclick = () => {
        updateFavoritesList();
        document.getElementById('favoritesModal').style.display = 'flex';
    };
    
    // 🎓 Quiz interactif
    document.getElementById('btnQuiz').onclick = openQuiz;
    document.getElementById('closeQuizModal').onclick = () => {
        document.getElementById('quizModal').style.display = 'none';
    };
    
    // ===========================
    // SYSTÈME D'ANNOTATIONS (Toggle entre 2 versions)
    // ===========================
    
    // Toggle entre version normale et version annotée
    document.getElementById('btnToggleAnnotations').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        const icon = document.getElementById('annotationsIcon');
        const currentSrc = viewer.src;
        
        if (!currentSrc) {
            alert('⚠️ Veuillez d\'abord charger un modèle 3D');
            return;
        }
        
        // Basculer entre les versions (toujours sur le .glb ; ios-src suit si un .usdz compagnon existe)
        if (currentSrc.includes('-annotated.glb')) {
            // Passer à la version sans annotations
            const newSrc = currentSrc.replace('-annotated.glb', '.glb');
            applyModelSources(viewer, newSrc);
            state.annotationsVisible = false;
            icon.textContent = '🙈';
            console.log('📖 Mode exploration (sans annotations)');
        } else {
            // Passer à la version avec annotations
            const newSrc = currentSrc.replace(/\.glb$/i, '-annotated.glb');
            
            // Vérifier si la version annotée existe
            fetch(newSrc, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        applyModelSources(viewer, newSrc);
                        state.annotationsVisible = true;
                        icon.textContent = '👁️';
                        console.log('✅ Mode apprentissage (avec annotations)');
                    } else {
                        alert('ℹ️ Pas de version annotée disponible pour ce modèle.\n\nCréez une version avec "-annotated" dans le nom du fichier.');
                    }
                })
                .catch(() => {
                    alert('ℹ️ Pas de version annotée disponible pour ce modèle.\n\nCréez une version avec "-annotated" dans le nom du fichier.');
                });
        }
        
        // Sauvegarder la préférence
        localStorage.setItem('annotations_visible', state.annotationsVisible);
    };
    
    // Afficher / masquer le menu (donne toute la largeur au lecteur)
    document.getElementById('toggleSidebar').onclick = () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    };
    
    // Recherche dans tous les dossiers (le menu se réaffiche s'il était masqué)
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value;
        document.getElementById('sidebar').classList.remove('collapsed');
        renderMenu();
    };
});

// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPrompt').style.display = 'block';
});

document.getElementById('btnInstall').onclick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        document.getElementById('installPrompt').style.display = 'none';
    }
};

document.getElementById('btnDismiss').onclick = () => {
    document.getElementById('installPrompt').style.display = 'none';
};

// ===========================
// ADD MODEL FUNCTIONALITY
// ===========================

// Ouvrir la modale
document.getElementById('btnAddModel').onclick = () => {
    document.getElementById('addModelModal').style.display = 'flex';
};

// Fermer la modale
document.getElementById('closeModal').onclick = () => {
    document.getElementById('addModelModal').style.display = 'none';
};

// Fermer en cliquant en dehors
document.getElementById('addModelModal').onclick = (e) => {
    if (e.target.id === 'addModelModal') {
        document.getElementById('addModelModal').style.display = 'none';
    }
};

// Charger depuis fichier local
document.getElementById('btnSelectFile').onclick = () => {
    document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'glb') {
            const url = URL.createObjectURL(file);
            loadModelFromCustomSource({
                type: 'file',
                name: file.name.replace(/\.glb$/i, ''),
                format: ext,
                path: url
            });
            document.getElementById('addModelModal').style.display = 'none';
        } else {
            alert('⚠️ Format non supporté. Utilisez un fichier .glb (fonctionne sur Android, iOS et PC)');
        }
    }
};

// Charger depuis URL
document.getElementById('btnLoadUrl').onclick = () => {
    const url = document.getElementById('urlInput').value.trim();
    if (url) {
        const ext = url.split('.').pop().toLowerCase().split('?')[0];
        if (ext === 'glb') {
            const fileName = url.split('/').pop().split('?')[0];
            loadModelFromCustomSource({
                type: 'url',
                name: fileName.replace(/\.glb$/i, ''),
                format: ext,
                path: url
            });
            document.getElementById('addModelModal').style.display = 'none';
            document.getElementById('urlInput').value = '';
        } else {
            alert('⚠️ L\'URL doit pointer vers un fichier .glb');
        }
    } else {
        alert('⚠️ Veuillez entrer une URL valide');
    }
};

// Charger un modèle depuis une source personnalisée
function loadModelFromCustomSource(item) {
    const viewer = document.getElementById('modelViewer');
    
    showViewer();
    state.currentModel = item.path;
    resetVariantSelector();
    updateModelDisclaimer(item.path);
    applyModelSources(viewer, item.path);
    document.getElementById('modelTitle').textContent = item.name;
    document.getElementById('modelFile').textContent = item.name;
    document.getElementById('modelDims').textContent = '…';
    document.getElementById('modelFolder').textContent = getFolderLabel(item.path);
    
    // Détecter si le modèle a des animations
    setupAnimationButtons(viewer);
    
    console.log(`✅ Modèle chargé: ${item.name} (${item.format}) depuis ${item.type}`);
};

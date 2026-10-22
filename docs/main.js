// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const VERSION = 'V.1.54.0';

const CONFIG = {
    coursePath: '../Cours/',
    maxDepth: 5,
    supportedFormats: { 
        glb: '🤖', // Android
        usdz: '🍎' // iOS
    },
    githubUser: '', // Sera détecté automatiquement
    githubRepo: ''  // Sera détecté automatiquement
};

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
    dimensionsVisible: false // 📏 Cotes affichées (conservé au changement de modèle)
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

// Mention de droits sous le viewer pour les modèles de fabricants (Feller, Hager, anciens modèles Feller)
function updateModelDisclaimer(path) {
    const isBrandModel = /Cours\/(01-FELLER|02-HAGER|Enseignement\/Feller)\//i.test(decodeURIComponent(path || ''));
    document.getElementById('modelDisclaimer').hidden = !isBrandModel;
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
    ['btnDimensions', 'btnDimensionsMobile'].forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.toggle('active', visible);
        btn.setAttribute('aria-pressed', visible);
    });
    cancelAnimationFrame(dimFrame);
    dimFrame = null;
    if (visible) {
        updateDimensions();
        dimLoop();
    }
}

// Libellé du dossier d'un modèle (chemin relatif à Cours/) ou "Local"
function getFolderLabel(path) {
    if (!path || path.startsWith('blob:')) return 'Local';
    const match = decodeURIComponent(path).match(/Cours\/(.*)\/[^/]+$/);
    return match ? match[1] : '-';
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
            CONFIG.githubUser = hostname.split('.')[0];
            CONFIG.githubRepo = parts[0];
            console.log(`📦 Repo détecté: ${CONFIG.githubUser}/${CONFIG.githubRepo}`);
        }
    }
}

// Scan des dossiers via GitHub API
async function scanDirectory(path = CONFIG.coursePath, depth = 0) {
    if (depth >= CONFIG.maxDepth) return [];
    
    // Si on a déjà chargé ce dossier, retourner le cache
    if (state.loadedFolders.has(path)) {
        return state.loadedFolders.get(path);
    }
    
    try {
        // Essayer avec l'API GitHub
        if (CONFIG.githubUser && CONFIG.githubRepo) {
            const apiUrl = `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.githubRepo}/contents/docs/${path}`;
            console.log(`🔍 Scan: ${apiUrl}`);
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
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
                    } else if (item.type === 'file') {
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
                const visibleItems = items.filter(i => i.type !== 'link' || /^https?:\/\//i.test(i.url || ''));
                
                // Liens tout en haut, puis PDF, puis modèles, sous-dossiers à la fin (ordre GitHub conservé dans chaque groupe)
                const rank = (i) => ({ link: 0, pdf: 1, file: 2, folder: 3 })[i.type] ?? 2;
                visibleItems.sort((a, b) => rank(a) - rank(b));
                items.length = 0;
                items.push(...visibleItems);
                state.loadedFolders.set(path, items);
                return items;
            }
        }
    } catch (error) {
        console.warn('⚠️ API GitHub non disponible, utilisation de la structure locale');
    }
    
    // Fallback: structure par défaut pour le dossier racine
    if (path === CONFIG.coursePath) {
        const defaultFolders = ['01-FELLER', '02-HAGER', 'Enseignement'];
        
        return defaultFolders.map(name => ({
            type: 'folder',
            name: name,
            path: `${path}${name}/`,
            children: [],
            depth: depth,
            expanded: false
        }));
    }
    
    return [];
}

// Libellé affiché : dans Feller, le préfixe d'ordre « 01- » est masqué (« 01-EDIZIO.liv » → « EDIZIO.liv »)
function getDisplayName(item) {
    const inFeller = item.path.startsWith(FELLER_PATH) && item.path !== FELLER_PATH;
    return inFeller ? item.name.replace(/^\d+-/, '') : item.name;
}

// Icône d'un dossier : 🎓 pour le dossier principal Enseignement
function getFolderIcon(item) {
    return item.path === TEACHING_PATH ? '🎓' : '📁';
}

// Rendu du menu selon le mode (principal ou Feller)
function renderMenu() {
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';
    const isFeller = state.menuMode === 'feller';
    document.getElementById('btnBackMain').hidden = !isFeller;
    document.getElementById('menuDisclaimer').hidden = !isFeller;
    
    if (!isFeller) {
        renderFileTree(state.fileTree, fileTree);
        return;
    }
    
    // Titre « Design » puis les gammes dans l'ordre des préfixes
    const title = document.createElement('h3');
    title.className = 'menu-section-title';
    title.textContent = 'Design';
    fileTree.appendChild(title);
    renderFileTree(state.fellerTree, fileTree, '', 1);
}

// Ouvre le menu Feller (clic sur le logo ou sur le dossier 01-FELLER)
async function openFellerMenu() {
    state.menuMode = 'feller';
    document.getElementById('fileTree').innerHTML = '<div class="loading">Chargement de Feller...</div>';
    state.fellerTree = await scanDirectory(FELLER_PATH, 1);
    renderMenu();
    document.getElementById('sidebar').scrollTop = 0;
}

// Retour au menu principal
function openMainMenu() {
    state.menuMode = 'main';
    renderMenu();
}

// Rendu de l'arborescence (baseDepth : profondeur affichée sans retrait)
function renderFileTree(items, container, parentPath = '', baseDepth = 0) {
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.style.paddingLeft = `${(item.depth - baseDepth) * 20}px`;
        
        if (item.type === 'folder') {
            const folder = document.createElement('div');
            folder.className = 'tree-folder';
            const isExpanded = state.expandedFolders.has(item.path);
            const toggleIcon = isExpanded ? '▼' : '▶';
            folder.innerHTML = `<span class="tree-toggle">${toggleIcon}</span><span class="tree-icon">${getFolderIcon(item)}</span><span class="tree-label">${getDisplayName(item)}</span>`;
            
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
            pdf.innerHTML = `<span class="tree-icon">📄</span><span class="tree-label">${item.name}</span>`;
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
            file.innerHTML = `<span class="tree-icon">${CONFIG.supportedFormats[item.format]}</span><span class="tree-label">${item.name}</span>`;
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
    const welcomeScreen = document.getElementById('welcomeScreen');
    const viewerContainer = document.getElementById('viewerContainer');
    const btnAR = document.getElementById('btnAR');
    
    welcomeScreen.style.display = 'none';
    viewerContainer.style.display = 'block';
    
    // Définir le modèle actuel (important pour les annotations)
    state.currentModel = item.path;
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
    document.getElementById('modelFormat').textContent = item.format.toUpperCase();
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
    
    const fileTree = document.getElementById('fileTree');
    state.fileTree = await scanDirectory();
    renderMenu();
    
    // Menu Feller : clic sur le logo ; bouton de retour au menu principal
    document.getElementById('btnFellerLogo').onclick = openFellerMenu;
    document.getElementById('btnBackMain').onclick = openMainMenu;
    
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
    modelViewer.addEventListener('load', updateDimensions);
    modelViewer.addEventListener('variant-applied', updateDimensions);
    document.getElementById('btnDimensions').onclick = () => setDimensionsVisible(!state.dimensionsVisible);
    document.getElementById('btnDimensionsMobile').onclick = () => setDimensionsVisible(!state.dimensionsVisible);
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
        const modelFormat = document.getElementById('modelFormat').textContent;
        alert(`ℹ️ Détails du modèle\n\n📦 Nom: ${modelName}\n📁 Dossier: ${modelFolder}\n📱 Format: ${modelFormat}\n\nCliquez sur des parties du modèle pour plus d'informations (bientôt disponible).`);
    };
    
    // Options du menu déroulant
    document.getElementById('btnMeasure').onclick = () => {
        alert('📏 Mesures AR\n\nFonctionnalité en développement.\nBientôt vous pourrez mesurer les dimensions du modèle en réalité augmentée !');
    };
    
    document.getElementById('btnLighting').onclick = () => {
        alert('💡 Éclairage réaliste\n\nFonctionnalité en développement.\nLe modèle s\'adaptera automatiquement à l\'éclairage de votre environnement !');
    };
    
    document.getElementById('btnGestures').onclick = () => {
        alert('👆 Gestes avancés\n\nFonctionnalité en développement.\nBientôt vous pourrez contrôler le modèle avec des gestes personnalisés !');
    };
    
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
        const modelFormat = document.getElementById('modelFormat').textContent;
        
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
    
    document.getElementById('btnQuiz').onclick = () => {
        alert('🎓 Quiz interactif\n\nFonctionnalité en développement.\nBientôt vous pourrez tester vos connaissances avec des quiz sur les modèles 3D !');
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
    
    // Toggle sidebar mobile
    document.getElementById('toggleSidebar').onclick = () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    };
    
    // Recherche
    document.getElementById('searchInput').oninput = (e) => {
        state.searchQuery = e.target.value.toLowerCase();
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
    const welcomeScreen = document.getElementById('welcomeScreen');
    const viewerContainer = document.getElementById('viewerContainer');
    
    welcomeScreen.style.display = 'none';
    viewerContainer.style.display = 'block';
    
    state.currentModel = item.path;
    resetVariantSelector();
    updateModelDisclaimer(item.path);
    applyModelSources(viewer, item.path);
    document.getElementById('modelTitle').textContent = item.name;
    document.getElementById('modelFile').textContent = item.name;
    document.getElementById('modelFormat').textContent = item.format.toUpperCase();
    document.getElementById('modelFolder').textContent = getFolderLabel(item.path);
    
    // Détecter si le modèle a des animations
    setupAnimationButtons(viewer);
    
    console.log(`✅ Modèle chargé: ${item.name} (${item.format}) depuis ${item.type}`);
};

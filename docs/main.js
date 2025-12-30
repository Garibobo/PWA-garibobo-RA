// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const VERSION = 'V.1.50.0';

const CONFIG = {
    coursePath: '../Cours/',
    maxDepth: 4,
    supportedFormats: { 
        glb: '🤖', // Android
        usdz: '🍎' // iOS
    },
    githubUser: '', // Sera détecté automatiquement
    githubRepo: ''  // Sera détecté automatiquement
};

const state = {
    fileTree: [],
    currentModel: null,
    expandedFolders: new Set(),
    loadedFolders: new Map(),
    isIOS: false,
    isAndroid: false,
    annotations: new Map(), // Annotations par modèle
    annotationMode: false,
    annotationsVisible: true,
    pendingAnnotation: null
};

// Détecter la plateforme
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    state.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    state.isAndroid = /android/i.test(userAgent);
    
    const platform = state.isIOS ? 'iOS' : state.isAndroid ? 'Android' : 'Desktop';
    const format = state.isIOS ? '.usdz 🍎' : '.glb 🤖';
    
    console.log(`📱 Plateforme détectée: ${platform}`);
    
    // Afficher le message dans l'interface
    const platformInfo = document.getElementById('platformInfo');
    if (platformInfo) {
        if (state.isIOS) {
            platformInfo.innerHTML = '<strong>🍎 iOS détecté</strong> - Vous verrez uniquement les fichiers .usdz compatibles avec Quick Look AR';
        } else if (state.isAndroid) {
            platformInfo.innerHTML = '<strong>🤖 Android détecté</strong> - Vous verrez uniquement les fichiers .glb compatibles avec WebXR AR';
        } else {
            platformInfo.innerHTML = '<strong>💻 Desktop détecté</strong> - Vous verrez les fichiers .glb avec viewer 3D interactif';
        }
    }
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
                        
                        // Filtrer selon la plateforme
                        let shouldShow = false;
                        if (state.isIOS && ext === 'usdz') {
                            shouldShow = true; // iOS voit uniquement .usdz
                        } else if (state.isAndroid && ext === 'glb') {
                            shouldShow = true; // Android voit uniquement .glb
                        } else if (!state.isIOS && !state.isAndroid && ext === 'glb') {
                            shouldShow = true; // Desktop voit .glb
                        }
                        
                        if (shouldShow) {
                            items.push({
                                type: 'file',
                                name: item.name.replace(/\.(glb|usdz)$/, ''),
                                format: ext,
                                path: item.download_url,
                                depth: depth
                            });
                        }
                    }
                }
                
                state.loadedFolders.set(path, items);
                return items;
            }
        }
    } catch (error) {
        console.warn('⚠️ API GitHub non disponible, utilisation de la structure locale');
    }
    
    // Fallback: structure par défaut pour le dossier racine
    if (path === CONFIG.coursePath) {
        const defaultFolders = [
            'Electrotechnique', 'Nibt', 'Mathématiques', 'Metre', 'Physique',
            'Schema', 'Telecommunication', 'Prevention', 'Production-et-app.elec',
            'Electronique-Analogique', 'Dessin-Tech'
        ];
        
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

// Rendu de l'arborescence
function renderFileTree(items, container, parentPath = '') {
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.style.paddingLeft = `${item.depth * 20}px`;
        
        if (item.type === 'folder') {
            const folder = document.createElement('div');
            folder.className = 'tree-folder';
            const isExpanded = state.expandedFolders.has(item.path);
            const toggleIcon = isExpanded ? '▼' : '▶';
            folder.innerHTML = `<span class="tree-toggle">${toggleIcon}</span><span class="tree-icon">📁</span><span class="tree-label">${item.name}</span>`;
            
            folder.onclick = async (e) => {
                e.stopPropagation();
                await toggleFolder(item, div);
            };
            
            div.appendChild(folder);
            container.appendChild(div);
            
            // Si le dossier est déjà ouvert, afficher ses enfants
            if (isExpanded && item.children.length > 0) {
                renderFileTree(item.children, container, item.path);
            }
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
    
    // Re-render l'arborescence complète
    const fileTree = document.getElementById('fileTree');
    fileTree.innerHTML = '';
    renderFileTree(state.fileTree, fileTree);
}

// Chargement d'un modèle 3D
function loadModel(item) {
    const viewer = document.getElementById('modelViewer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const viewerContainer = document.getElementById('viewerContainer');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnAR = document.getElementById('btnAR');
    
    welcomeScreen.style.display = 'none';
    viewerContainer.style.display = 'block';
    
    // Définir le modèle actuel (important pour les annotations)
    state.currentModel = item.path;
    
    // Configurer le viewer selon le format
    viewer.src = item.path;
    
    // Pour iOS avec USDZ, configurer l'attribut ios-src
    if (item.format === 'usdz') {
        viewer.setAttribute('ios-src', item.path);
    } else {
        viewer.removeAttribute('ios-src');
    }
    
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
    
    // Charger les annotations existantes pour ce modèle
    updateAnnotationsOnModel();
    
    // Détecter si le modèle a des animations
    viewer.addEventListener('load', () => {
        const animations = viewer.availableAnimations;
        if (animations && animations.length > 0) {
            btnPlayPause.style.display = 'inline-block';
            console.log(`✅ ${animations.length} animation(s) détectée(s):`, animations);
        } else {
            btnPlayPause.style.display = 'none';
        }
    }, { once: true });
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
    renderFileTree(state.fileTree, fileTree);
    
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
        const modelPath = document.getElementById('modelPath').textContent;
        const modelFormat = document.getElementById('modelFormat').textContent;
        alert(`ℹ️ Détails du modèle\n\n📦 Nom: ${modelName}\n📁 Chemin: ${modelPath}\n📱 Format: ${modelFormat}\n\nCliquez sur des parties du modèle pour plus d'informations (bientôt disponible).`);
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
        const modelPath = document.getElementById('modelPath').textContent;
        const modelFormat = document.getElementById('modelFormat').textContent;
        
        if (!modelPath || modelPath === '-') {
            alert('⚠️ Aucun modèle chargé\n\nVeuillez d\'abord charger un modèle 3D.');
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
                    <div class="favorite-icon">${fav.format === '.glb' ? '🤖' : '🍎'}</div>
                    <div class="favorite-info">
                        <div class="favorite-name">${fav.name}</div>
                        <div class="favorite-path">${fav.path}</div>
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
                    loadModel(fav.path);
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
        
        // Basculer entre les versions
        if (currentSrc.includes('-annotated.glb') || currentSrc.includes('-annotated.usdz')) {
            // Passer à la version sans annotations
            const newSrc = currentSrc.replace('-annotated.glb', '.glb').replace('-annotated.usdz', '.usdz');
            viewer.src = newSrc;
            if (state.isIOS && newSrc.endsWith('.usdz')) {
                viewer.setAttribute('ios-src', newSrc);
            }
            state.annotationsVisible = false;
            icon.textContent = '🙈';
            console.log('📖 Mode exploration (sans annotations)');
        } else {
            // Passer à la version avec annotations
            const ext = currentSrc.endsWith('.usdz') ? '.usdz' : '.glb';
            const newSrc = currentSrc.replace(ext, `-annotated${ext}`);
            
            // Vérifier si la version annotée existe
            fetch(newSrc, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        viewer.src = newSrc;
                        if (state.isIOS && newSrc.endsWith('.usdz')) {
                            viewer.setAttribute('ios-src', newSrc);
                        }
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
        renderFileTree(state.fileTree, fileTree);
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
        if (ext === 'glb' || ext === 'usdz') {
            const url = URL.createObjectURL(file);
            loadModelFromCustomSource({
                type: 'file',
                name: file.name.replace(/\.(glb|usdz)$/, ''),
                format: ext,
                path: url
            });
            document.getElementById('addModelModal').style.display = 'none';
        } else {
            alert('⚠️ Format non supporté. Utilisez .glb ou .usdz');
        }
    }
};

// Charger depuis URL
document.getElementById('btnLoadUrl').onclick = () => {
    const url = document.getElementById('urlInput').value.trim();
    if (url) {
        const ext = url.split('.').pop().toLowerCase().split('?')[0];
        if (ext === 'glb' || ext === 'usdz') {
            const fileName = url.split('/').pop().split('?')[0];
            loadModelFromCustomSource({
                type: 'url',
                name: fileName.replace(/\.(glb|usdz)$/, ''),
                format: ext,
                path: url
            });
            document.getElementById('addModelModal').style.display = 'none';
            document.getElementById('urlInput').value = '';
        } else {
            alert('⚠️ L\'URL doit pointer vers un fichier .glb ou .usdz');
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
    const btnPlayPause = document.getElementById('btnPlayPause');
    
    welcomeScreen.style.display = 'none';
    viewerContainer.style.display = 'block';
    
    viewer.src = item.path;
    document.getElementById('modelTitle').textContent = item.name;
    document.getElementById('modelFile').textContent = item.name;
    document.getElementById('modelFormat').textContent = item.format.toUpperCase();
    
    // Détecter si le modèle a des animations
    viewer.addEventListener('load', () => {
        const animations = viewer.availableAnimations;
        if (animations && animations.length > 0) {
            btnPlayPause.style.display = 'inline-block';
            console.log(`✅ ${animations.length} animation(s) détectée(s):`, animations);
        } else {
            btnPlayPause.style.display = 'none';
        }
    }, { once: true });
    
    console.log(`✅ Modèle chargé: ${item.name} (${item.format}) depuis ${item.type}`);
};

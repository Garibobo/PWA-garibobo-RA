// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const CONFIG = {
    coursePath: 'Cours/',
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
    isAndroid: false
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
    
    // Configurer le viewer selon le format
    viewer.src = item.path;
    
    // Pour iOS avec USDZ, configurer l'attribut ios-src
    if (item.format === 'usdz') {
        viewer.setAttribute('ios-src', item.path);
    } else {
        viewer.removeAttribute('ios-src');
    }
    
    // Masquer le bouton AR sur desktop
    if (!state.isIOS && !state.isAndroid) {
        btnAR.style.display = 'none';
    } else {
        btnAR.style.display = 'inline-block';
    }
    
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
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Détecter la plateforme
    detectPlatform();
    
    // Détecter le repo GitHub
    detectGitHubRepo();
    
    const fileTree = document.getElementById('fileTree');
    state.fileTree = await scanDirectory();
    renderFileTree(state.fileTree, fileTree);
    
    // Bouton AR
    document.getElementById('btnAR').onclick = () => {
        document.getElementById('modelViewer').activateAR();
    };
    
    // Bouton Reset
    document.getElementById('btnReset').onclick = () => {
        const viewer = document.getElementById('modelViewer');
        viewer.cameraOrbit = 'auto auto auto';
    };
    
    // Bouton Play/Pause Animation
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

// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const CONFIG = {
    coursePath: 'Cours/',
    maxDepth: 4,
    supportedFormats: { glb: '📦', usdz: '📱' },
    githubUser: '', // Sera détecté automatiquement
    githubRepo: ''  // Sera détecté automatiquement
};

const state = {
    fileTree: [],
    currentModel: null,
    expandedFolders: new Set(),
    loadedFolders: new Map()
};

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
                        if (ext === 'glb' || ext === 'usdz') {
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
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
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

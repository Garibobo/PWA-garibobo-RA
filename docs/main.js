// Garibobo RA - Main JavaScript
// Scan automatique et affichage des modèles 3D

const CONFIG = {
    coursePath: 'Cours/',
    maxDepth: 4,
    supportedFormats: { glb: '📦', usdz: '📱' }
};

const state = {
    fileTree: [],
    currentModel: null,
    expandedFolders: new Set()
};

// Scan des dossiers (GitHub API ou structure par défaut)
async function scanDirectory(path = CONFIG.coursePath, depth = 0) {
    if (depth >= CONFIG.maxDepth) return [];
    
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
        depth: depth
    }));
}

// Rendu de l'arborescence
function renderFileTree(items, container) {
    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        
        if (item.type === 'folder') {
            const folder = document.createElement('div');
            folder.className = 'tree-folder';
            folder.innerHTML = `<span class="tree-toggle">▶</span><span class="tree-icon">📁</span><span class="tree-label">${item.name}</span>`;
            div.appendChild(folder);
        } else {
            const file = document.createElement('div');
            file.className = 'tree-file';
            file.innerHTML = `<span class="tree-icon">${CONFIG.supportedFormats[item.format]}</span><span class="tree-label">${item.name}</span>`;
            file.onclick = () => loadModel(item);
            div.appendChild(file);
        }
        
        container.appendChild(div);
    });
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

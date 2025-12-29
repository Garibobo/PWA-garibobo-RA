# 🥽 Garibobo RA - Visualiseur 3D en Réalité Augmentée

Application PWA complète pour visualiser des modèles 3D en réalité augmentée, destinée aux élèves du Domaine 3 - Électricité.

## ✨ Fonctionnalités

- 📱 **Compatible Android & iOS** : WebXR, Scene Viewer (.glb) et Quick Look (.usdz)
- 🗂️ **Arborescence automatique** : Scan automatique jusqu'à 4 niveaux de dossiers
- 🥽 **Réalité Augmentée** : Visualisation AR native sur mobile
- 🔄 **Rotation 360°** : Exploration complète des modèles
- 📴 **Mode Offline** : Fonctionne sans connexion après première visite
- 🎨 **Interface moderne** : Design sombre et responsive

## 🚀 Déploiement sur GitHub Pages

### 1. Créer le repository

```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit - Garibobo RA"

# Créer le repo sur GitHub et le lier
git remote add origin https://github.com/VOTRE_USERNAME/Garibobo-RA.git
git branch -M main
git push -u origin main
```

### 2. Activer GitHub Pages

1. Allez dans **Settings** > **Pages**
2. Source : **Deploy from a branch**
3. Branch : **main** → Dossier : **/docs**
4. Cliquez sur **Save**

### 3. Accéder à votre PWA

Votre application sera disponible à :
```
https://VOTRE_USERNAME.github.io/Garibobo-RA/
```

## 📁 Structure du projet

```
Garibobo-RA/
├── docs/                          # Dossier racine de la PWA
│   ├── index.html                 # Page principale
│   ├── styles.css                 # Styles CSS
│   ├── main.js                    # JavaScript principal
│   ├── sw.js                      # Service Worker (offline)
│   ├── manifest.webmanifest       # Manifest PWA
│   │
│   ├── icons/                     # Icônes de l'application
│   │   ├── icon-192.png          # Icône 192x192
│   │   └── icon-512.png          # Icône 512x512
│   │
│   └── Cours/                     # Dossiers de cours
│       ├── Electrotechnique/
│       ├── Nibt/
│       ├── Mathématiques/
│       ├── Metre/
│       ├── Physique/
│       ├── Schema/
│       ├── Telecommunication/
│       ├── Prevention/
│       ├── Production-et-app.elec/
│       ├── Electronique-Analogique/
│       └── Dessin-Tech/
│
└── README.md                      # Ce fichier
```

## 📦 Ajouter des modèles 3D

### 1. Préparer vos modèles

Vous avez besoin de **deux formats** pour une compatibilité complète :

- **`.glb`** : Pour Android (WebXR / Scene Viewer)
- **`.usdz`** : Pour iOS (Quick Look)

### 2. Convertir vos modèles

#### GLB → USDZ (pour iOS)

**Option A : Outil en ligne**
- [Autodesk Viewer](https://viewer.autodesk.com/)
- [Blender](https://www.blender.org/) (gratuit)

**Option B : Reality Converter (Mac uniquement)**
1. Téléchargez [Reality Converter](https://developer.apple.com/augmented-reality/tools/)
2. Glissez-déposez votre fichier `.glb`
3. Exportez en `.usdz`

**Option C : Blender (Windows/Mac/Linux)**
```bash
# Installer Blender
# Ouvrir le fichier .glb
# File > Export > USD (.usdz)
```

### 3. Organiser vos fichiers

Placez vos modèles dans les dossiers appropriés :

```bash
docs/Cours/Electrotechnique/
├── transformateur.glb
├── transformateur.usdz
├── moteur-asynchrone.glb
└── moteur-asynchrone.usdz
```

### 4. Créer des sous-dossiers (jusqu'à 4 niveaux)

```bash
docs/Cours/Electrotechnique/
├── Chapitre-1-Transformateurs/
│   ├── Section-A-Monophase/
│   │   ├── transformateur-simple.glb
│   │   └── transformateur-simple.usdz
│   └── Section-B-Triphase/
│       ├── transformateur-tri.glb
│       └── transformateur-tri.usdz
└── Chapitre-2-Moteurs/
    ├── moteur-dc.glb
    └── moteur-dc.usdz
```

**L'arborescence s'affichera automatiquement dans l'interface !**

## 🎨 Personnaliser les icônes

1. Créez un logo carré (512x512px minimum)
2. Exportez en PNG :
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
3. Remplacez les fichiers dans `docs/icons/`

**Outils recommandés :**
- [Favicon.io](https://favicon.io/)
- [Canva](https://www.canva.com/)
- Photoshop / GIMP

## 📱 Installer la PWA

### Sur Android

1. Ouvrez l'application dans Chrome
2. Cliquez sur le menu (⋮)
3. Sélectionnez **"Installer l'application"**
4. L'icône apparaît sur votre écran d'accueil

### Sur iOS

1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton Partager (□↑)
3. Sélectionnez **"Sur l'écran d'accueil"**
4. Confirmez l'installation

## 🔧 Développement local

Pour tester localement avant le déploiement :

```bash
# Avec Python
cd docs
python -m http.server 8000

# Avec Node.js (http-server)
npm install -g http-server
cd docs
http-server -p 8000

# Avec PHP
cd docs
php -S localhost:8000
```

Puis ouvrez : `http://localhost:8000`

## 🛠️ Technologies utilisées

- **Model Viewer** : Affichage des modèles 3D
- **WebXR** : Réalité augmentée Android
- **AR Quick Look** : Réalité augmentée iOS
- **Service Worker** : Mode offline
- **PWA** : Installation sur mobile

## 📝 Ajouter de nouveaux cours

1. Créez un nouveau dossier dans `docs/Cours/`
2. Ajoutez vos fichiers `.glb` et `.usdz`
3. Commit et push sur GitHub
4. L'arborescence se met à jour automatiquement !

```bash
# Exemple
mkdir docs/Cours/Nouveau-Cours
# Ajoutez vos modèles 3D
git add .
git commit -m "Ajout nouveau cours"
git push
```

## 🐛 Dépannage

### Les modèles ne s'affichent pas

- Vérifiez que les fichiers sont bien en `.glb` ou `.usdz`
- Vérifiez les chemins des fichiers
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### L'AR ne fonctionne pas

- **Android** : Vérifiez que Google Play Services AR est installé
- **iOS** : Utilisez Safari (pas Chrome)
- Assurez-vous d'avoir les deux formats (.glb ET .usdz)

### La PWA ne s'installe pas

- Vérifiez que vous êtes en HTTPS (GitHub Pages l'est automatiquement)
- Vérifiez que les icônes existent dans `docs/icons/`
- Videz le cache du navigateur

## 👨‍🏫 Auteur

**Amir Garibovic**  
Domaine 3 - Électricité  
Version 1.0

## 📄 Licence

Ce projet est destiné à un usage éducatif pour les élèves du Domaine 3 - Électricité.

---

**🎓 Bon apprentissage avec la réalité augmentée !**

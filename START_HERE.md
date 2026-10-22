# 🚀 START HERE - Garibobo RA

## 🎉 Bienvenue

Votre projet **Garibobo RA** est prêt ! Cette application PWA permet de visualiser des modèles 3D en réalité augmentée.

---

## 📖 Par où commencer ?

### 1️⃣ Lecture rapide (5 minutes)

Lisez **QUICK_START.md** pour déployer en 5 minutes.

### 2️⃣ Instructions complètes

Lisez **INSTRUCTIONS_FINALES.md** pour le guide pas à pas.

### 3️⃣ Documentation détaillée

Consultez **README.md** et **GUIDE_COMPLET.md** pour tout savoir.

---

## ⚡ Actions immédiates

### ⚠️ AVANT DE DÉPLOYER

1. **Créez vos icônes PWA** (OBLIGATOIRE)
   - `docs/icons/icon-192.png` (192x192px)
   - `docs/icons/icon-512.png` (512x512px)
   - Voir `docs/icons/README.md` pour les instructions

2. **Ajoutez des modèles 3D** (optionnel pour tester)
   - Format : `.glb` (Android) + `.usdz` (iOS)
   - Placez-les dans `docs/Cours/[NomDuCours]/`

### 🚀 DÉPLOYER SUR GITHUB

```bash
# 1. Initialiser Git
git init
git add .
git commit -m "Initial commit"

# 2. Créer le repo sur github.com (nommez-le "Garibobo-RA")

# 3. Lier et pousser
git remote add origin https://github.com/VOTRE_USERNAME/Garibobo-RA.git
git branch -M main
git push -u origin main

# 4. Activer GitHub Pages
# Settings > Pages > Source: main > Folder: /docs
```

### 🎯 ACCÉDER À VOTRE PWA

```text
https://VOTRE_USERNAME.github.io/Garibobo-RA/
```

---

## 📁 Structure du projet

```text
Garibobo-RA/
├── 📄 START_HERE.md              ← Vous êtes ici !
├── 📄 QUICK_START.md             ← Démarrage rapide
├── 📄 INSTRUCTIONS_FINALES.md    ← Guide pas à pas
├── 📄 README.md                  ← Documentation principale
├── 📄 GUIDE_COMPLET.md          ← Guide détaillé
├── 📄 PROJECT_SUMMARY.md        ← Résumé technique
├── 📄 deploy.ps1                ← Script déploiement
│
└── 📂 docs/                     ← Application PWA
    ├── index.html               ← Page principale
    ├── styles.css               ← Styles
    ├── main.js                  ← JavaScript
    ├── sw.js                    ← Service Worker
    ├── manifest.webmanifest     ← Manifest PWA
    │
    ├── 📂 icons/                ← ⚠️ À COMPLÉTER
    │   ├── PLACEHOLDER.txt
    │   ├── README.md
    │   └── icon-placeholder.svg
    │
    └── 📂 Cours/                ← Vos cours ici
        ├── Electrotechnique/
        ├── Nibt/
        ├── Mathématiques/
        ├── Metre/
        ├── Physique/
        ├── Schema/
        ├── Telecommunication/
        ├── Prevention/
        ├── Production-et-app.elec/
        ├── Electronique-Analogique/
        └── Dessin-Tech/
```

---

## ✨ Fonctionnalités

- ✅ **PWA complète** - Installation sur mobile
- ✅ **Mode offline** - Fonctionne sans connexion
- ✅ **Réalité augmentée** - Android (WebXR) + iOS (Quick Look)
- ✅ **Scan automatique** - Arborescence générée automatiquement
- ✅ **4 niveaux** - Dossiers et sous-dossiers
- ✅ **Responsive** - Mobile, tablette, desktop
- ✅ **Recherche** - Filtrage des modèles

---

## 🎨 Personnalisation

### Changer les couleurs

Éditez `docs/styles.css` (lignes 7-15)

### Changer le titre

Éditez `docs/index.html` (lignes 33-35)

### Ajouter des cours

Créez un dossier dans `docs/Cours/` et ajoutez vos modèles `.glb` + `.usdz`

---

## 📱 Utilisation

### Installation mobile

- **Android** : Chrome > Menu > Installer l'application
- **iOS** : Safari > Partager > Sur l'écran d'accueil

### Voir en AR

1. Sélectionnez un modèle 3D
2. Cliquez sur "🥽 Voir en AR"
3. Pointez votre caméra vers une surface plane

---

## 🔄 Mise à jour

```bash
# Ajouter des modèles
cp nouveau.glb docs/Cours/Electrotechnique/
cp nouveau.usdz docs/Cours/Electrotechnique/

# Déployer
git add .
git commit -m "Ajout modèles"
git push
```

**Les élèves verront les nouveaux modèles automatiquement !**

---

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| **START_HERE.md** | Ce fichier - Point de départ |
| **QUICK_START.md** | Démarrage rapide (5 min) |
| **INSTRUCTIONS_FINALES.md** | Guide pas à pas complet |
| **README.md** | Documentation principale |
| **GUIDE_COMPLET.md** | Guide détaillé + dépannage |
| **PROJECT_SUMMARY.md** | Résumé technique |

---

## ❓ Questions fréquentes

### Les icônes sont obligatoires ?

**Oui !** Sans icônes, la PWA ne s'installera pas sur mobile.

### Quel format pour les modèles 3D ?

- **Android** : `.glb`
- **iOS** : `.usdz`
- **Les deux** pour compatibilité complète

### Comment convertir GLB en USDZ ?

- **Mac** : Reality Converter (gratuit)
- **Windows** : Blender (gratuit)
- **En ligne** : Autodesk Viewer

### Combien de dossiers puis-je créer ?

Maximum **4 niveaux** de profondeur.

---

## 🎯 Checklist de démarrage

- [ ] Lire QUICK_START.md
- [ ] Créer les icônes (192px + 512px)
- [ ] Initialiser Git
- [ ] Créer le repo sur GitHub
- [ ] Pousser le code
- [ ] Activer GitHub Pages
- [ ] Tester l'URL
- [ ] Ajouter des modèles 3D
- [ ] Installer sur mobile
- [ ] Partager aux élèves

---

## 📞 Support

**Amir Garibovic**  
📧 <amir.garibovic@eduvaud.ch>  
🏫 Domaine 3 - Électricité

---

## 🎉 Prêt à démarrer

1. **Créez vos icônes** → `docs/icons/`
2. **Déployez sur GitHub** → Suivez QUICK_START.md
3. **Ajoutez des modèles 3D** → `docs/Cours/`
4. **Partagez l'URL** → À vos élèves

**Bon enseignement avec la réalité augmentée ! 🥽**

---

**Version 1.0 - Novembre 2025**

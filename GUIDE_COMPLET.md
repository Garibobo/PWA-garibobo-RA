# 📘 Guide Complet - Garibobo RA

## 🎯 Vue d'ensemble

Garibobo RA est une Progressive Web App (PWA) permettant de visualiser des modèles 3D en réalité augmentée. Elle fonctionne sur tous les navigateurs modernes et supporte nativement l'AR sur Android et iOS.

---

## 📋 Table des matières

1. [Installation et déploiement](#1-installation-et-déploiement)
2. [Ajouter des modèles 3D](#2-ajouter-des-modèles-3d)
3. [Conversion de formats](#3-conversion-de-formats)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Personnalisation](#5-personnalisation)
6. [Utilisation sur mobile](#6-utilisation-sur-mobile)
7. [Dépannage](#7-dépannage)

---

## 1. Installation et déploiement

### Étape 1 : Créer le repository GitHub

```bash
# Dans le dossier Garibobo-RA
git init
git add .
git commit -m "Initial commit - Garibobo RA v1.0"
```

### Étape 2 : Créer le repo sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **New repository**
3. Nom : `Garibobo-RA`
4. Public ou Private (Public recommandé pour GitHub Pages)
5. **Ne cochez PAS** "Initialize with README"
6. Cliquez sur **Create repository**

### Étape 3 : Lier et pousser

```bash
git remote add origin https://github.com/VOTRE_USERNAME/Garibobo-RA.git
git branch -M main
git push -u origin main
```

### Étape 4 : Activer GitHub Pages

1. Dans votre repo, allez dans **Settings**
2. Menu de gauche : **Pages**
3. **Source** : Deploy from a branch
4. **Branch** : `main` → Dossier : `/docs`
5. Cliquez sur **Save**
6. Attendez 1-2 minutes

### Étape 5 : Accéder à votre PWA

```
https://VOTRE_USERNAME.github.io/Garibobo-RA/
```

---

## 2. Ajouter des modèles 3D

### Format requis

Pour une compatibilité complète Android + iOS, vous avez besoin de **2 formats** :

| Format | Plateforme | Extension |
|--------|-----------|-----------|
| GLB    | Android   | `.glb`    |
| USDZ   | iOS       | `.usdz`   |

### Où placer les fichiers

Placez vos modèles dans les dossiers de cours :

```
docs/Cours/Electrotechnique/
├── transformateur.glb
├── transformateur.usdz
├── moteur.glb
└── moteur.usdz
```

### Créer des sous-dossiers

Vous pouvez créer jusqu'à **4 niveaux** de dossiers :

```
docs/Cours/Electrotechnique/
└── Chapitre-1/
    └── Section-A/
        └── Exercice-1/
            ├── modele.glb
            └── modele.usdz
```

**L'arborescence apparaîtra automatiquement dans l'interface !**

---

## 3. Conversion de formats

### Option 1 : Reality Converter (Mac uniquement)

1. Téléchargez [Reality Converter](https://developer.apple.com/augmented-reality/tools/)
2. Glissez-déposez votre fichier `.glb`
3. Exportez en `.usdz`

### Option 2 : Blender (Windows/Mac/Linux)

```bash
# 1. Installer Blender (gratuit)
https://www.blender.org/download/

# 2. Ouvrir Blender
# 3. File > Import > glTF 2.0 (.glb)
# 4. Sélectionnez votre fichier .glb
# 5. File > Export > Universal Scene Description (.usdz)
# 6. Sauvegardez avec le même nom
```

### Option 3 : Outils en ligne

- [Autodesk Viewer](https://viewer.autodesk.com/)
- [Sketchfab](https://sketchfab.com/) (téléchargement en plusieurs formats)
- [Poly Pizza](https://poly.pizza/) (modèles gratuits)

### Option 4 : Script Python (avancé)

```python
# Nécessite USD Python
pip install usd-core

# Script de conversion
import os
from pxr import Usd, UsdGeom

def convert_glb_to_usdz(glb_path, usdz_path):
    stage = Usd.Stage.Open(glb_path)
    stage.Export(usdz_path)

convert_glb_to_usdz("modele.glb", "modele.usdz")
```

---

## 4. Structure des dossiers

### Structure actuelle

```
docs/
├── index.html              # Page principale
├── styles.css              # Styles
├── main.js                 # JavaScript
├── sw.js                   # Service Worker (offline)
├── manifest.webmanifest    # Manifest PWA
│
├── icons/
│   ├── icon-192.png       # Icône 192x192
│   └── icon-512.png       # Icône 512x512
│
└── Cours/
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

### Ajouter un nouveau cours

```bash
# 1. Créer le dossier
mkdir docs/Cours/Nouveau-Cours

# 2. Ajouter vos modèles
cp modele.glb docs/Cours/Nouveau-Cours/
cp modele.usdz docs/Cours/Nouveau-Cours/

# 3. Commit et push
git add .
git commit -m "Ajout Nouveau-Cours"
git push
```

**Le nouveau cours apparaîtra automatiquement dans le menu !**

### Créer des sous-dossiers

```bash
# Exemple avec 4 niveaux
mkdir -p docs/Cours/Electrotechnique/Chapitre-1/Section-A/Exercice-1

# Ajouter les modèles
cp modele.glb docs/Cours/Electrotechnique/Chapitre-1/Section-A/Exercice-1/
cp modele.usdz docs/Cours/Electrotechnique/Chapitre-1/Section-A/Exercice-1/
```

---

## 5. Personnalisation

### Changer les icônes

1. Créez un logo carré (512x512px)
2. Exportez en PNG :
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
3. Remplacez les fichiers dans `docs/icons/`

**Outils recommandés :**
- [Favicon.io](https://favicon.io/)
- [Canva](https://www.canva.com/)
- Photoshop / GIMP

### Changer les couleurs

Éditez `docs/styles.css` :

```css
:root {
    --primary-color: #1976D2;      /* Couleur principale */
    --primary-dark: #1565C0;       /* Couleur foncée */
    --primary-light: #42A5F5;      /* Couleur claire */
    --background: #121212;         /* Fond */
    --surface: #1E1E1E;            /* Surface */
}
```

### Changer le titre

Éditez `docs/index.html` :

```html
<h1>Garibobo RA</h1>
<p class="subtitle">Visualiseur 3D - Domaine 3 Électricité</p>
```

### Changer le footer

Éditez `docs/index.html` :

```html
<footer class="footer">
    <p>Réalisé par Amir Garibovic - Domaine 3 Électricité - V.1.0</p>
</footer>
```

---

## 6. Utilisation sur mobile

### Installation Android

1. Ouvrez l'application dans **Chrome**
2. Appuyez sur le menu (⋮)
3. Sélectionnez **"Installer l'application"**
4. L'icône apparaît sur votre écran d'accueil

### Installation iOS

1. Ouvrez l'application dans **Safari**
2. Appuyez sur le bouton **Partager** (□↑)
3. Faites défiler et sélectionnez **"Sur l'écran d'accueil"**
4. Appuyez sur **"Ajouter"**

### Utiliser la réalité augmentée

#### Sur Android

1. Sélectionnez un modèle dans le menu
2. Appuyez sur le bouton **"🥽 Voir en AR"**
3. Pointez votre caméra vers une surface plane
4. Le modèle apparaît en AR

**Prérequis :** Google Play Services AR (installé automatiquement)

#### Sur iOS

1. Sélectionnez un modèle dans le menu
2. Appuyez sur le bouton **"🥽 Voir en AR"**
3. Pointez votre caméra vers une surface plane
4. Le modèle apparaît en AR

**Prérequis :** iOS 12+ avec puce A9 ou supérieure

---

## 7. Dépannage

### Les modèles ne s'affichent pas

**Causes possibles :**

1. **Format incorrect**
   - Vérifiez que les fichiers sont en `.glb` ou `.usdz`
   - Utilisez un validateur : [glTF Validator](https://github.khronos.org/glTF-Validator/)

2. **Chemin incorrect**
   - Vérifiez que les fichiers sont dans `docs/Cours/`
   - Respectez la casse (majuscules/minuscules)

3. **Fichier corrompu**
   - Ouvrez le fichier dans Blender pour vérifier
   - Réexportez le modèle

**Solution :**

```bash
# Vérifier la structure
ls -R docs/Cours/

# Vérifier les extensions
find docs/Cours/ -name "*.glb"
find docs/Cours/ -name "*.usdz"
```

### L'AR ne fonctionne pas

**Sur Android :**

1. Vérifiez que **Google Play Services AR** est installé
2. Utilisez **Chrome** (pas Firefox ou autre)
3. Autorisez l'accès à la caméra
4. Assurez-vous d'avoir un fichier `.glb`

**Sur iOS :**

1. Utilisez **Safari** (pas Chrome)
2. iOS 12+ requis
3. Autorisez l'accès à la caméra
4. Assurez-vous d'avoir un fichier `.usdz`

### La PWA ne s'installe pas

**Vérifications :**

1. **HTTPS requis** (GitHub Pages l'a automatiquement)
2. **Manifest valide** : Vérifiez `docs/manifest.webmanifest`
3. **Icônes présentes** : Vérifiez `docs/icons/icon-192.png` et `icon-512.png`
4. **Service Worker** : Vérifiez `docs/sw.js`

**Test :**

```bash
# Ouvrir la console du navigateur (F12)
# Onglet Application > Manifest
# Vérifier que tout est vert
```

### Mode offline ne fonctionne pas

1. Visitez l'application une première fois (pour installer le Service Worker)
2. Ouvrez la console (F12) > Application > Service Workers
3. Vérifiez que le SW est activé
4. Testez en mode avion

### Erreur 404 sur GitHub Pages

**Causes :**

1. GitHub Pages pas activé
2. Mauvaise branche/dossier sélectionné
3. Temps de déploiement (attendez 2-3 minutes)

**Solution :**

```bash
# Vérifier le déploiement
# Settings > Pages > Vérifier l'URL affichée

# Forcer un nouveau déploiement
git commit --allow-empty -m "Trigger rebuild"
git push
```

### Les sous-dossiers n'apparaissent pas

**Vérifications :**

1. Maximum 4 niveaux de profondeur
2. Fichiers `.glb` ou `.usdz` présents
3. Pas de caractères spéciaux dans les noms

**Structure correcte :**

```
✅ Cours/Electro/Chapitre-1/modele.glb
✅ Cours/Electro/Ch1/Sec-A/modele.glb
❌ Cours/Electro/Ch1/Sec/Sub/Deep/modele.glb (trop profond)
```

---

## 🎓 Ressources supplémentaires

### Modèles 3D gratuits

- [Poly Pizza](https://poly.pizza/) - Modèles 3D gratuits
- [Sketchfab](https://sketchfab.com/) - Bibliothèque immense
- [TurboSquid](https://www.turbosquid.com/Search/3D-Models/free) - Modèles gratuits
- [CGTrader](https://www.cgtrader.com/free-3d-models) - Modèles gratuits

### Outils de création 3D

- [Blender](https://www.blender.org/) - Gratuit et puissant
- [Tinkercad](https://www.tinkercad.com/) - Simple et en ligne
- [SketchUp](https://www.sketchup.com/) - Facile à apprendre

### Documentation technique

- [Model Viewer](https://modelviewer.dev/) - Documentation officielle
- [WebXR](https://immersiveweb.dev/) - Standard AR web
- [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) - AR iOS

---

## 📞 Support

Pour toute question ou problème :

**Amir Garibovic**  
📧 amir.garibovic@eduvaud.ch  
🏫 Domaine 3 - Électricité

---

**Version 1.0 - Novembre 2025**

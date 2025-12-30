# 📋 Changelog - Garibobo RA

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

---

## [V.1.49.0] - 30 Décembre 2024

### ✨ Ajouté
- Optimisation responsive complète pour tous les appareils (PC, Mac, tablettes, smartphones)
- Breakpoints professionnels : Desktop (>1200px), Tablettes (768-1200px), Mobile (<768px)
- Contrôles tactiles optimisés pour tablettes et mobiles (zones de toucher 44-48px)
- Script inline pour application immédiate du thème (évite flash de contenu)
- Icônes de navigation vers Site Internet Garibobo et Garibobo Agenda dans le header
- Support complet des icônes PWA depuis le dossier favicon_RA

### 🔄 Modifié
- Nom court de l'application : "Garibobo RA" → "RA Garibobo"
- Header : titre et sous-titre forcés en blanc pour meilleure lisibilité
- Logo principal : utilise maintenant favicon_RA au lieu de icon-192.png
- Service Worker : version v1.0 → v1.1 avec nouvelles icônes favicon_RA
- Icônes header Site Internet et Agenda : SVG remplacés par PNG authentiques
- Model-viewer : hauteurs adaptatives (600px desktop, 500px tablette, 400px mobile)
- Sidebar : largeurs responsives (320px desktop, 280px tablette, 100% mobile)
- Footer : padding et tailles de police optimisés par breakpoint
- Welcome screen : grille adaptative et textes redimensionnés

### 🐛 Corrigé
- Mode sombre ne fonctionnait pas sur mobile (site web et PWA)
- Texte header illisible en mode jour (noir sur bleu)
- Icônes PWA incorrectes (utilisait favicon_site au lieu de favicon_RA)
- Flash de contenu en mode clair au chargement sur mobile

### 🎨 Design
- Icônes navigation header : 45px desktop, 42px tablette, 38px mobile
- Boutons tactiles : taille minimale garantie pour accessibilité
- Espacements optimisés pour chaque format d'écran
- Transitions fluides et feedback visuel amélioré

---

## [V.1.48.0] - 21 Décembre 2024

### ✨ Ajouté
- Système d'annotations simplifié avec toggle entre 2 versions de modèles
- Bouton "Annotations" pour basculer entre version normale et version annotée
- Vérification automatique de l'existence de la version annotée
- Guide complet Blender pour créer des annotations 3D (`GUIDE_ANNOTATIONS_BLENDER.md`)
- Support des annotations intégrées dans Blender (flèches + textes 3D)

### 🔄 Modifié
- Suppression du système d'annotations manuel complexe
- Simplification de l'interface : un seul bouton toggle
- Icône dynamique : 👁️ (visible) ↔ 🙈 (masqué)

### 🗑️ Supprimé
- Modale d'annotations manuelle
- Système de création d'annotations par clic
- Stockage localStorage des annotations manuelles

---

## [V.1.47.0] - 20 Décembre 2024

### ✨ Ajouté
- Détection Chrome iOS avec message d'avertissement
- Amélioration compatibilité WebGL pour Chrome iOS
- Attributs model-viewer optimisés pour iOS

### 🐛 Corrigé
- Problème de prévisualisation 3D sur iPhone Chrome
- Bouton enregistrer annotations qui ne fonctionnait pas
- Définition de `state.currentModel` lors du chargement

---

## [V.1.46.0] - 19 Décembre 2024

### ✨ Ajouté
- Système de chargement d'annotations pré-définies depuis JSON
- Fonction `loadPredefinedAnnotations(modelName)`
- Support fichier `annotations.json` dans dossier Cours

### 🔄 Modifié
- Fonction `loadModel()` charge maintenant les annotations automatiquement
- Annotations pré-définies marquées comme non supprimables

---

## [V.1.45.0] - 18 Décembre 2024

### ✨ Ajouté
- Optimisation du header pour mobile (compact sur une ligne)
- Réduction des tailles de police et padding sur smartphone
- Masquage du sous-titre sur petits écrans

### 🔄 Modifié
- Header responsive : titre, version et toggle thème sur une ligne
- Amélioration de l'ergonomie mobile

---

## [V.1.44.0] - 17 Décembre 2024

### ✨ Ajouté
- Déplacement du dossier Cours à la racine du projet
- Mise à jour de tous les chemins (`../Cours/`)
- Amélioration de la structure du projet

### 🔄 Modifié
- CONFIG.coursePath : `'../Cours/'`
- Tous les liens et imports mis à jour

---

## [V.1.43.0] - 16 Décembre 2024

### ✨ Ajouté
- Système d'annotations avec hotspots sur modèles 3D
- Modale d'annotations avec formulaire
- Sauvegarde des annotations dans localStorage
- Affichage/masquage des annotations
- Suppression individuelle et globale des annotations

### 🔄 Modifié
- Interface enrichie avec gestion des annotations
- Support tactile pour placement des annotations

---

## [V.1.42.0] - 15 Décembre 2024

### ✨ Ajouté
- Fonction de capture d'écran du modèle 3D
- Bouton "📸 Capture" dans le menu
- Téléchargement automatique de l'image PNG

### 🔄 Modifié
- Amélioration de l'interface utilisateur
- Ajout d'icônes pour les boutons

---

## [V.1.41.0] - 14 Décembre 2024

### ✨ Ajouté
- Mode sombre/clair avec toggle
- Sauvegarde de la préférence dans localStorage
- Icône dynamique : 🌙 (sombre) ↔ ☀️ (clair)
- Transitions fluides entre les thèmes

### 🔄 Modifié
- Styles CSS adaptés pour les deux thèmes
- Variables CSS pour faciliter la maintenance

---

## [V.1.40.0] - 13 Décembre 2024

### ✨ Ajouté
- Système de favoris pour les modèles
- Modale de gestion des favoris
- Sauvegarde dans localStorage
- Bouton ⭐ dans le menu Options

### 🔄 Modifié
- Interface enrichie avec système de favoris
- Amélioration de la navigation

---

## [V.1.39.0] - 12 Décembre 2024

### ✨ Ajouté
- Support des animations 3D
- Bouton Play/Pause pour les animations
- Détection automatique des animations dans les modèles

### 🔄 Modifié
- Interface model-viewer avec contrôles d'animation
- Amélioration de l'expérience utilisateur

---

## [V.1.38.0] - 11 Décembre 2024

### ✅ Version initiale stable
- Scan automatique des modèles 3D dans le dossier Cours
- Support GLB (Android) et USDZ (iOS)
- Visualisation 3D avec model-viewer
- Mode AR (réalité augmentée)
- Interface responsive mobile/desktop
- Arborescence de fichiers dynamique
- Recherche de modèles
- Plein écran
- Rotation automatique
- Zoom personnalisé
- PWA installable

---

## 🎯 Fonctionnalités principales

### Visualisation 3D
- ✅ Support GLB et USDZ
- ✅ Rotation 360° interactive
- ✅ Zoom et pan
- ✅ Plein écran
- ✅ Capture d'écran

### Réalité Augmentée
- ✅ Mode AR sur iOS (ARKit)
- ✅ Mode AR sur Android (ARCore)
- ✅ Placement des modèles dans l'environnement réel

### Annotations
- ✅ Toggle entre version normale et annotée
- ✅ Annotations créées dans Blender
- ✅ Flèches et textes 3D intégrés
- ✅ Visibles en 3D et en AR

### Interface
- ✅ Mode sombre/clair
- ✅ Responsive mobile/desktop
- ✅ Navigation intuitive
- ✅ Recherche de modèles
- ✅ Système de favoris

### PWA
- ✅ Installation sur tous les appareils
- ✅ Mode hors ligne
- ✅ Icônes et splash screens
- ✅ Mises à jour automatiques

---

## 📝 Notes de version

### Convention de nommage
- **Majeur** (X.0.0) : Changements majeurs, refonte
- **Mineur** (0.X.0) : Nouvelles fonctionnalités
- **Patch** (0.0.X) : Corrections de bugs

### Fichiers importants
- `docs/main.js` : Logique principale
- `docs/index.html` : Structure HTML
- `docs/styles.css` : Styles et thèmes
- `GUIDE_ANNOTATIONS_BLENDER.md` : Guide pour créer annotations

---

*Développé par Amir Garibovic - Domaine 3 Électricité - EPSIC*

# 📋 Historique des versions - Garibobo RA

## Version actuelle : V.1.25.4

---

## 🔄 Changelog

### V.1.25.4 (18 novembre 2025)

#### ✨ Nouvelles fonctionnalités

- ✅ **Système de versionnage** affiché dans le header (en haut à droite)
- ✅ **Version visible** sur desktop et mobile
- ✅ **Badge de version** avec design moderne (fond semi-transparent)
- ✅ **Console log** de la version au démarrage

#### 🔧 Corrections

- ✅ **Bouton AR masqué** sur desktop (pas de caméra AR)
- ✅ **Configuration AR optimisée** pour Android
  - Ajout de `ar-placement="floor"`
  - Ajout de `camera-orbit` optimisé
  - Limites de zoom configurées
- ✅ **Support iOS** amélioré avec `ios-src`

#### 🎨 Améliorations UI

- ✅ **Icône agrandie** : 50px → 80px (desktop), 60px (mobile)
- ✅ **Fond blanc** pour l'icône (évite la troncature)
- ✅ **Header padding** augmenté pour meilleure lisibilité
- ✅ **Version responsive** : taille adaptée sur mobile

#### 🤖 Filtrage par plateforme

- ✅ **Android** : Voit uniquement les fichiers `.glb` (🤖)
- ✅ **iOS** : Voit uniquement les fichiers `.usdz` (🍎)
- ✅ **Desktop** : Voit les fichiers `.glb` (🤖)
- ✅ **Message informatif** de plateforme détectée

#### ➕ Ajout de modèles

- ✅ **Bouton "Ajouter un modèle"** dans la sidebar
- ✅ **Chargement depuis fichier local** (appareil)
- ✅ **Chargement depuis URL** (internet)
- ✅ **Modale moderne** avec 2 options
- ✅ **Validation** des formats (.glb/.usdz)

#### 🎬 Animations 3D

- ✅ **Support complet** des animations GLB
- ✅ **Lecture automatique** au chargement
- ✅ **Bouton Play/Pause** (apparaît si animé)
- ✅ **Détection automatique** des animations

#### 🗂️ Navigation dynamique

- ✅ **Scan automatique** via API GitHub
- ✅ **Arborescence interactive** (clic pour ouvrir/fermer)
- ✅ **Chargement à la demande** des sous-dossiers
- ✅ **Cache intelligent** pour performance
- ✅ **Indentation visuelle** par niveau (20px)

#### 📱 PWA

- ✅ **Icônes** 192px et 512px créées
- ✅ **Service Worker** pour mode offline
- ✅ **Manifest** complet
- ✅ **Installation** sur mobile

---

## 📦 Versions précédentes

### V.1.0.0 (17 novembre 2025)

- ✅ Création initiale du projet
- ✅ Structure de base PWA
- ✅ Viewer 3D avec model-viewer
- ✅ Support AR Android/iOS
- ✅ Arborescence statique
- ✅ Design responsive

---

## 🔮 Prochaines versions

### V.1.26.0 (à venir)

- 💾 Sauvegarde locale des modèles chargés
- 📋 Historique des modèles récents
- ⭐ Système de favoris
- 📤 Partage de modèles entre utilisateurs
- 🔍 Recherche améliorée avec filtres

### V.2.0.0 (futur)

- 🎨 Éditeur de matériaux 3D
- 📊 Statistiques d'utilisation
- 👥 Mode multi-utilisateurs
- 🌐 Support multilingue (FR/EN/DE)
- 🎓 Mode enseignant avec gestion de classe

---

## 📝 Comment mettre à jour la version

### 1. Modifier la constante VERSION

**Fichier** : `docs/main.js`

```javascript
const VERSION = 'V.1.25.4'; // ← Changer ici
```

### 2. Mettre à jour le HTML

**Fichier** : `docs/index.html`

```html
<span class="version">V.1.25.4</span>  <!-- Header -->
<p>... - V.1.25.4</p>                   <!-- Footer -->
```

### 3. Mettre à jour le manifest

**Fichier** : `docs/manifest.webmanifest`

```json
{
  "name": "Garibobo RA - Visualiseur 3D",
  "version": "1.25.4",
  ...
}
```

### 4. Documenter les changements

**Fichier** : `VERSION.md`

- Ajoutez une nouvelle section avec la version
- Listez les nouvelles fonctionnalités
- Listez les corrections
- Listez les améliorations

### 5. Commit et push

```bash
git add .
git commit -m "Version 1.25.4 - [Description des changements]"
git push
```

---

## 🏷️ Convention de versionnage

Format : **V.MAJEUR.MINEUR.PATCH**

- **MAJEUR** : Changements incompatibles (breaking changes)
- **MINEUR** : Nouvelles fonctionnalités (rétrocompatibles)
- **PATCH** : Corrections de bugs

### Exemples

- `V.1.0.0` → `V.2.0.0` : Refonte complète
- `V.1.25.0` → `V.1.26.0` : Nouvelle fonctionnalité
- `V.1.25.4` → `V.1.25.5` : Correction de bug

---

## 📊 Statistiques

### Version actuelle

- **Date de sortie** : 18 novembre 2025
- **Fichiers modifiés** : 3 (index.html, styles.css, main.js)
- **Lignes ajoutées** : ~150
- **Fonctionnalités** : 25+
- **Bugs corrigés** : 5

### Depuis le début

- **Versions publiées** : 2
- **Commits** : 15+
- **Fichiers créés** : 20+
- **Documentation** : 10+ fichiers MD

---

## 🎯 Objectifs de qualité

- ✅ **Code propre** : Commentaires, indentation, nommage clair
- ✅ **Documentation** : README, guides, changelog
- ✅ **Responsive** : Mobile, tablette, desktop
- ✅ **Performance** : Cache, lazy loading, optimisations
- ✅ **Accessibilité** : ARIA, contrastes, navigation clavier
- ✅ **Sécurité** : HTTPS, CSP, validation des entrées

---

**Garibobo RA - Visualiseur 3D en Réalité Augmentée**
*Réalisé par Amir Garibovic - Domaine 3 Électricité*

# 📱 Filtrage par Plateforme

## ✅ Problème résolu

**Avant** : Sur Android, vous voyiez les fichiers `.usdz` (iOS) qui ne fonctionnent pas.

**Maintenant** : Chaque plateforme voit uniquement les fichiers compatibles !

---

## 🎯 Fonctionnement

### 🤖 Android
- ✅ Voit **uniquement** les fichiers `.glb`
- ✅ Icône : **🤖** (robot Android)
- ✅ AR via **WebXR / Scene Viewer**

### 🍎 iOS
- ✅ Voit **uniquement** les fichiers `.usdz`
- ✅ Icône : **🍎** (pomme Apple)
- ✅ AR via **Quick Look**

### 💻 Desktop
- ✅ Voit les fichiers `.glb`
- ✅ Icône : **🤖**
- ✅ Viewer 3D interactif (pas d'AR)

---

## 🔧 Détection automatique

### Au démarrage de la PWA

1. **Détection de la plateforme** via User Agent
2. **Affichage d'un message** informatif :
   - Android : "🤖 Android détecté - Vous verrez uniquement les fichiers .glb"
   - iOS : "🍎 iOS détecté - Vous verrez uniquement les fichiers .usdz"
   - Desktop : "💻 Desktop détecté - Vous verrez les fichiers .glb"

3. **Filtrage automatique** des fichiers dans l'arborescence

---

## 📂 Exemple de structure

### Dans votre repo GitHub

```
docs/Cours/Electrotechnique/
├── moteur.glb      ← Visible sur Android et Desktop
└── moteur.usdz     ← Visible sur iOS uniquement
```

### Ce que voit chaque plateforme

**Android** :
```
📁 Electrotechnique
  └── 🤖 moteur
```

**iOS** :
```
📁 Electrotechnique
  └── 🍎 moteur
```

**Desktop** :
```
📁 Electrotechnique
  └── 🤖 moteur
```

---

## 🎨 Nouvelles icônes

### Avant
- `.glb` → 📦 (paquet)
- `.usdz` → 📱 (téléphone)

### Maintenant
- `.glb` → **🤖** (Android)
- `.usdz` → **🍎** (iOS)

Plus clair et plus intuitif ! 🎉

---

## 💡 Avantages

### Pour les utilisateurs
- ✅ **Pas de confusion** : Ils voient uniquement ce qui fonctionne sur leur appareil
- ✅ **Interface épurée** : Moins de fichiers affichés
- ✅ **Message clair** : Ils savent quelle plateforme est détectée

### Pour vous (enseignant)
- ✅ **Même fichier, deux formats** : Nommez-les pareil (ex: `moteur.glb` et `moteur.usdz`)
- ✅ **Gestion simplifiée** : Les élèves voient automatiquement le bon format
- ✅ **Pas de support technique** : Tout est automatique !

---

## 🧪 Test

### Sur votre Android Fold 4

1. **Ouvrez la PWA**
2. **Vérifiez le message** : "🤖 Android détecté"
3. **Naviguez dans les dossiers**
4. **Vous verrez uniquement** les fichiers avec l'icône 🤖
5. **Aucun fichier .usdz** ne sera affiché !

### Console (F12 sur Desktop)

Vous verrez :
```
📱 Plateforme détectée: Android
```

---

## 🔍 Code technique

### Détection de plateforme

```javascript
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    state.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    state.isAndroid = /android/i.test(userAgent);
}
```

### Filtrage des fichiers

```javascript
// iOS voit uniquement .usdz
if (state.isIOS && ext === 'usdz') {
    shouldShow = true;
}
// Android voit uniquement .glb
else if (state.isAndroid && ext === 'glb') {
    shouldShow = true;
}
// Desktop voit .glb
else if (!state.isIOS && !state.isAndroid && ext === 'glb') {
    shouldShow = true;
}
```

---

## 📋 Checklist pour ajouter un modèle

Pour qu'un modèle soit visible sur **toutes les plateformes** :

- [ ] Créez le modèle en `.glb` (pour Android/Desktop)
- [ ] Convertissez-le en `.usdz` (pour iOS)
- [ ] Nommez-les **exactement pareil** : `moteur.glb` et `moteur.usdz`
- [ ] Placez-les dans le **même dossier**
- [ ] Pushez sur GitHub

**Résultat** : Tous vos élèves verront "moteur" avec l'icône correspondant à leur plateforme !

---

## 🐛 Dépannage

### Je vois toujours les fichiers .usdz sur Android

- Vérifiez que vous avez bien pushé les modifications
- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez la console : `📱 Plateforme détectée: Android`

### Le message de plateforme ne s'affiche pas

- Vérifiez que `platformInfo` existe dans le HTML
- Ouvrez la console pour voir les erreurs
- Rechargez la page

### Aucun fichier ne s'affiche

- Vérifiez que vous avez des fichiers `.glb` (Android) ou `.usdz` (iOS)
- Vérifiez que les fichiers sont dans `docs/Cours/`
- Vérifiez la console pour les erreurs API GitHub

---

## ✅ Résumé des changements

### Fichiers modifiés

1. **main.js**
   - ✅ Fonction `detectPlatform()` ajoutée
   - ✅ Filtrage des fichiers selon plateforme
   - ✅ Icônes mises à jour (🤖 et 🍎)
   - ✅ Message informatif affiché

2. **index.html**
   - ✅ Div `platformInfo` ajoutée pour le message

### Fonctionnalités

- ✅ Détection automatique Android/iOS/Desktop
- ✅ Filtrage intelligent des fichiers
- ✅ Icônes spécifiques par plateforme
- ✅ Message informatif pour l'utilisateur
- ✅ Console log pour debug

---

**Votre PWA est maintenant parfaitement adaptée à chaque plateforme ! 🎉**

**Pushez et testez sur votre Fold 4 !** 🚀

# ➕ Guide : Ajouter des modèles 3D

Votre PWA Garibobo RA permet maintenant d'ajouter des modèles 3D de **deux façons** :

## 🎯 Fonctionnalités

- ✅ **Depuis votre appareil** : Chargez un fichier .glb ou .usdz depuis votre téléphone/PC
- ✅ **Depuis une URL** : Collez un lien direct vers un modèle 3D en ligne
- ✅ **Détection automatique** du format (GLB pour Android, USDZ pour iOS)
- ✅ **Support des animations** : Les modèles animés fonctionnent aussi !
- ✅ **Visualisation immédiate** : Le modèle s'affiche directement dans le viewer

---

## 📱 Utilisation sur mobile

### Option 1 : Depuis votre appareil

1. **Cliquez sur le bouton** "➕ Ajouter un modèle" (dans la barre latérale)
2. **Choisissez** "📁 Depuis votre appareil"
3. **Sélectionnez** un fichier :
   - Android : Fichier `.glb`
   - iOS : Fichier `.usdz`
4. Le modèle s'affiche immédiatement ! 🎉

### Option 2 : Depuis une URL

1. **Cliquez sur** "➕ Ajouter un modèle"
2. **Choisissez** "🔗 Depuis une URL"
3. **Collez** le lien direct vers le fichier :

   ```text
   https://exemple.com/mon-modele.glb
   ```

4. **Cliquez sur** "Charger depuis l'URL"
5. Le modèle s'affiche ! 🎉

---

## 🌐 Où trouver des URLs de modèles 3D ?

### Sketchfab (recommandé)

1. Allez sur <https://sketchfab.com/>
2. Cherchez un modèle (ex: "electric motor")
3. Cliquez sur **"Download 3D Model"**
4. Sélectionnez **"glTF Binary (.glb)"**
5. Une fois téléchargé, vous pouvez :
   - Le charger depuis votre appareil
   - Ou l'héberger et utiliser l'URL

### Poly Pizza

1. <https://poly.pizza/>
2. Cherchez votre modèle
3. Cliquez sur le modèle
4. **Clic droit** sur le bouton de téléchargement > "Copier l'adresse du lien"
5. Collez cette URL dans la PWA

### GitHub (pour vos propres modèles)

Si vous hébergez vos modèles sur GitHub :

```text
https://raw.githubusercontent.com/VOTRE_USERNAME/VOTRE_REPO/main/modele.glb
```

---

## 📦 Exemples d'URLs directes

### Modèles de test Google

```text
https://modelviewer.dev/shared-assets/models/Astronaut.glb
https://modelviewer.dev/shared-assets/models/RobotExpressive.glb
```

### Modèles glTF Sample

```text
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb
```

---

## 🎬 Modèles avec animations

Les modèles animés fonctionnent parfaitement ! Essayez :

```text
https://modelviewer.dev/shared-assets/models/RobotExpressive.glb
```

Ce robot a plusieurs animations qui se lancent automatiquement.

---

## 💾 Télécharger un modèle sur votre appareil

### Sur Android

1. Téléchargez un fichier `.glb` depuis Sketchfab
2. Le fichier est dans **Téléchargements**
3. Dans la PWA : "➕ Ajouter un modèle" > "Depuis votre appareil"
4. Naviguez vers **Téléchargements**
5. Sélectionnez votre fichier `.glb`

### Sur iOS

1. Téléchargez un fichier `.usdz` (ou `.glb` converti)
2. Le fichier est dans **Fichiers** > **Téléchargements**
3. Dans la PWA : "➕ Ajouter un modèle" > "Depuis votre appareil"
4. Sélectionnez votre fichier

---

## 🔄 Convertir GLB en USDZ (pour iOS)

Si vous avez un fichier `.glb` et voulez le voir sur iOS :

### Option 1 : Reality Converter (Mac uniquement)

1. Téléchargez **Reality Converter** (gratuit sur Mac App Store)
2. Glissez votre fichier `.glb`
3. Exportez en `.usdz`

### Option 2 : Convertisseur en ligne

1. <https://www.vectary.com/3d-modeling-news/usdz-converter/>
2. Uploadez votre `.glb`
3. Téléchargez le `.usdz`

---

## ⚠️ Limitations

### Fichiers locaux

- ✅ Fonctionnent parfaitement
- ⚠️ Non sauvegardés : Si vous rechargez la page, le modèle disparaît
- 💡 Solution : Utilisez l'URL ou ajoutez le fichier dans le repo GitHub

### URLs externes

- ✅ Sauvegardées dans l'historique du navigateur
- ⚠️ Nécessitent une connexion internet
- ⚠️ Le serveur doit autoriser CORS (Cross-Origin Resource Sharing)

### Formats supportés

- ✅ `.glb` (glTF Binary) - Android et Desktop
- ✅ `.usdz` (Universal Scene Description) - iOS uniquement
- ❌ `.obj`, `.fbx`, `.stl` - Non supportés (convertissez-les en .glb)

---

## 🎯 Cas d'usage

### Pour les élèves

**Visualiser un modèle partagé par le prof :**

1. Le prof partage une URL : `https://exemple.com/moteur.glb`
2. L'élève ouvre la PWA
3. Clique sur "➕ Ajouter un modèle"
4. Colle l'URL
5. Visualise le modèle en 3D et AR ! 🥽

### Pour les enseignants

**Tester un nouveau modèle avant de l'ajouter au repo :**

1. Téléchargez un modèle depuis Sketchfab
2. Chargez-le depuis votre appareil
3. Testez-le en 3D et AR
4. Si validé, ajoutez-le au repo GitHub

---

## 🐛 Dépannage

### "Format non supporté"

- Vérifiez que le fichier est bien `.glb` ou `.usdz`
- Les extensions doivent être en minuscules

### "Erreur de chargement" (URL)

- Vérifiez que l'URL est correcte
- Vérifiez que le serveur autorise CORS
- Essayez avec une URL de test (voir exemples ci-dessus)

### Le modèle ne s'affiche pas

- Vérifiez la console (F12) pour les erreurs
- Essayez avec un modèle de test Google
- Vérifiez votre connexion internet (pour les URLs)

### Le bouton AR ne fonctionne pas

- Sur Android : Assurez-vous d'utiliser Chrome
- Sur iOS : Assurez-vous d'utiliser Safari
- Le format doit correspondre : `.glb` pour Android, `.usdz` pour iOS

---

## 💡 Astuces

### Créer une bibliothèque de liens

Créez un fichier texte avec vos URLs favorites :

```text
Moteur électrique:
https://exemple.com/moteur.glb

Transformateur:
https://exemple.com/transfo.glb

Disjoncteur:
https://exemple.com/disjoncteur.glb
```

Copiez-collez les URLs au besoin !

### Partager un modèle avec vos élèves

1. Hébergez le fichier sur GitHub, Dropbox, ou Google Drive
2. Obtenez le lien direct (pas de page de prévisualisation)
3. Partagez l'URL avec vos élèves
4. Ils peuvent le charger directement dans la PWA !

---

## 🚀 Prochaines améliorations possibles

- 💾 Sauvegarde locale des modèles chargés
- 📋 Historique des modèles récents
- ⭐ Favoris
- 📤 Partage de modèles entre utilisateurs

---

## ✅ Résumé

- ✅ Bouton "➕ Ajouter un modèle" dans la sidebar
- ✅ Chargement depuis fichier local (appareil)
- ✅ Chargement depuis URL (internet)
- ✅ Support GLB (Android) et USDZ (iOS)
- ✅ Animations supportées
- ✅ Visualisation 3D et AR immédiate

**Profitez de cette nouvelle fonctionnalité pour tester rapidement des modèles 3D ! 🎉**

# 🎬 Guide des Animations 3D

Votre PWA Garibobo RA supporte les **animations 3D automatiques** !

## ✨ Fonctionnalités

- ✅ **Lecture automatique** des animations au chargement
- ✅ **Détection automatique** des animations dans les fichiers .glb
- ✅ **Bouton Play/Pause** qui apparaît si le modèle est animé
- ✅ **Toutes les animations** sont lues en boucle
- ✅ **Compatible AR** : les animations fonctionnent aussi en réalité augmentée !

## 📦 Formats supportés

### GLB (Android/Desktop)
- ✅ Animations complètes
- ✅ Plusieurs animations par fichier
- ✅ Rotation, translation, morphing
- ✅ Animations squelettiques

### USDZ (iOS)
- ✅ Animations basiques supportées
- ⚠️ Plus complexe à créer

## 🎯 Exemples d'animations pour vos cours

### Électrotechnique
- **Moteur électrique** : Rotor qui tourne
- **Alternateur** : Rotation du champ magnétique
- **Transformateur** : Flux magnétique animé
- **Disjoncteur** : Ouverture/fermeture des contacts

### Schémas
- **Circuit électrique** : Électrons qui circulent
- **Relais** : Activation de la bobine
- **Contacteur** : Fermeture des contacts
- **LED** : Clignotement

### Mécanique
- **Engrenages** : Rotation synchronisée
- **Piston** : Mouvement alternatif
- **Courroie** : Transmission de mouvement

## 🛠️ Créer des modèles animés

### Option 1 : Blender (gratuit et puissant)

1. **Téléchargez Blender** : https://www.blender.org/
2. **Créez ou importez** votre modèle 3D
3. **Ajoutez des animations** :
   - Sélectionnez l'objet
   - Passez en mode Animation (en haut)
   - Ajoutez des keyframes (touche I)
   - Définissez la rotation, position, échelle
4. **Exportez en GLB** :
   - File > Export > glTF 2.0 (.glb)
   - ✅ Cochez "Animation"
   - ✅ Cochez "Apply Modifiers"
   - Exportez

### Option 2 : Télécharger des modèles animés

#### Sketchfab (recommandé)
1. Allez sur https://sketchfab.com/
2. Recherchez votre modèle
3. Filtrez par **"Animated"**
4. Téléchargez en format **glTF Binary (.glb)**

#### Autres sources
- **Poly Pizza** : https://poly.pizza/
- **TurboSquid** : https://www.turbosquid.com/Search/3D-Models/free/animated
- **CGTrader** : https://www.cgtrader.com/free-3d-models/animated

### Option 3 : Convertir depuis d'autres formats

Si vous avez un fichier .fbx, .obj, .dae avec animations :

1. Ouvrez dans **Blender**
2. File > Import > [Votre format]
3. Vérifiez que les animations sont présentes (Timeline en bas)
4. File > Export > glTF 2.0 (.glb)

## 📝 Tutoriel Blender - Animation simple

### Exemple : Moteur qui tourne

```
1. Créez un cylindre (Add > Mesh > Cylinder)
2. Passez en mode Animation (en haut)
3. Frame 1 : Rotation Z = 0° → Appuyez sur I > Rotation
4. Frame 120 : Rotation Z = 360° → Appuyez sur I > Rotation
5. Sélectionnez les 2 keyframes → Graph Editor > Modifiers > Cycles
6. Exportez en GLB
```

**Résultat** : Votre moteur tourne en boucle ! 🔄

## ⚙️ Paramètres d'animation

### Dans Blender (avant export)

- **FPS** : 24 ou 30 (Frame Rate)
- **Durée** : 2-5 secondes pour une boucle fluide
- **Type d'interpolation** : Linear ou Bezier
- **Boucle** : Assurez-vous que la dernière frame = première frame

### Dans votre PWA (automatique)

- ✅ Lecture automatique au chargement
- ✅ Boucle infinie
- ✅ Vitesse normale (1x)
- ✅ Toutes les animations jouées simultanément

## 🎨 Bonnes pratiques

### Performance
- ⚠️ Gardez les animations **courtes** (2-5 secondes)
- ⚠️ Limitez le nombre de **keyframes** (10-30 max)
- ⚠️ Optimisez la **géométrie** (< 50k triangles)
- ✅ Testez sur mobile avant de publier

### Qualité
- ✅ Animations **fluides** (30 FPS minimum)
- ✅ Mouvements **réalistes** (pas trop rapides)
- ✅ Boucles **seamless** (début = fin)
- ✅ Testez en **AR** pour vérifier le rendu

### Organisation
```
docs/Cours/Electrotechnique/
├── moteur-statique.glb        ← Sans animation
├── moteur-statique.usdz
├── moteur-anime.glb           ← Avec animation
└── moteur-anime.usdz
```

## 🔧 Dépannage

### L'animation ne se lance pas

1. **Vérifiez dans Blender** :
   - Timeline > Play (barre espace)
   - L'animation doit jouer dans Blender

2. **Vérifiez l'export** :
   - ✅ Cochez "Animation" dans les options d'export
   - ✅ Format : glTF Binary (.glb)

3. **Vérifiez dans la console** :
   - F12 > Console
   - Cherchez : "animation(s) détectée(s)"

### L'animation est saccadée

- Augmentez le nombre de keyframes
- Utilisez l'interpolation "Bezier"
- Réduisez la complexité du modèle

### L'animation ne boucle pas

- Dans Blender : Graph Editor > Modifiers > Cycles
- Assurez-vous que frame 1 = frame finale

## 📚 Ressources

### Tutoriels Blender
- [Blender Guru - Animation Basics](https://www.youtube.com/c/BlenderGuruOfficial)
- [CG Cookie - Animation Fundamentals](https://cgcookie.com/)
- [Blender Manual - Animation](https://docs.blender.org/manual/en/latest/animation/)

### Modèles gratuits animés
- [Sketchfab - Animated Models](https://sketchfab.com/tags/animated)
- [Poly Pizza](https://poly.pizza/)
- [Mixamo - Personnages animés](https://www.mixamo.com/)

### Outils
- [Blender](https://www.blender.org/) - Gratuit
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/) - Tester vos GLB
- [glTF Validator](https://github.khronos.org/glTF-Validator/) - Vérifier les erreurs

---

## 🎉 C'est tout !

Vos modèles animés vont **impressionner vos élèves** ! 🚀

Les animations se lancent automatiquement et le bouton Play/Pause apparaît uniquement si le modèle est animé.

**Bon amusement avec les animations 3D !** 🎬

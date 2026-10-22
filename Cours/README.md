# 📚 Dossier Cours

Ce dossier contient tous les cours avec leurs modèles 3D.

## 📁 Structure actuelle

- **Electrotechnique/** - Cours d'électrotechnique
- **Nibt/** - Normes et installations basse tension
- **Mathématiques/** - Cours de mathématiques
- **Metre/** - Cours de métré
- **Physique/** - Cours de physique
- **Schema/** - Schémas électriques
- **Telecommunication/** - Télécommunications
- **Prevention/** - Prévention et sécurité
- **Production-et-app.elec/** - Production et applications électriques
- **Electronique-Analogique/** - Électronique analogique
- **Dessin-Tech/** - Dessin technique

## 📦 Ajouter des modèles 3D

### Format requis

Chaque modèle doit être disponible en **2 formats** :

- **`.glb`** → Pour Android (WebXR / Scene Viewer)
- **`.usdz`** → Pour iOS (Quick Look)

### Exemple

```text
Electrotechnique/
├── transformateur.glb
├── transformateur.usdz
├── moteur-asynchrone.glb
└── moteur-asynchrone.usdz
```

### Créer des sous-dossiers

Vous pouvez créer jusqu'à **4 niveaux** de sous-dossiers :

```text
Electrotechnique/
└── Chapitre-1-Transformateurs/
    └── Section-A-Monophase/
        └── Exercice-1/
            ├── modele.glb
            └── modele.usdz
```

## 🔄 Conversion GLB → USDZ

### Méthode 1 : Reality Converter (Mac)

1. Téléchargez [Reality Converter](https://developer.apple.com/augmented-reality/tools/)
2. Glissez-déposez votre `.glb`
3. Exportez en `.usdz`

### Méthode 2 : Blender (Tous OS)

1. Ouvrez Blender
2. File > Import > glTF 2.0 (.glb)
3. File > Export > USD (.usdz)

### Méthode 3 : Outils en ligne

- [Autodesk Viewer](https://viewer.autodesk.com/)
- [Sketchfab](https://sketchfab.com/)

## ✅ Bonnes pratiques

1. **Nommage** : Utilisez des noms clairs et sans espaces
   - ✅ `transformateur-monophase.glb`
   - ❌ `Transformateur Monophasé.glb`

2. **Taille** : Optimisez vos modèles
   - Cible : < 10 MB par modèle
   - Utilisez des textures compressées

3. **Organisation** : Groupez par thème
   - Créez des sous-dossiers logiques
   - Maximum 4 niveaux de profondeur

4. **Paires** : Toujours les 2 formats
   - Chaque `.glb` doit avoir son `.usdz`
   - Même nom de fichier

## 🎓 Ressources

### Modèles 3D gratuits

- [Poly Pizza](https://poly.pizza/)
- [Sketchfab](https://sketchfab.com/)
- [TurboSquid Free](https://www.turbosquid.com/Search/3D-Models/free)

### Outils de création

- [Blender](https://www.blender.org/) - Gratuit
- [Tinkercad](https://www.tinkercad.com/) - En ligne
- [SketchUp](https://www.sketchup.com/) - Facile

---

**Les modèles ajoutés ici apparaîtront automatiquement dans l'interface !**

# 📘 Guide Blender 5 : Créer des Annotations 3D avec Flèches

**Pour débutants - Domaine Électricité**  
*Par Amir Garibovic - Garibobo RA*

---

## 🎯 Objectif

Apprendre à ajouter des **flèches et textes 3D** sur vos modèles électriques pour créer des annotations pédagogiques visibles en réalité augmentée.

**Exemple :** Annoter un contacteur avec "Borne L", "Borne N", "Bobine 24V"

---

## 📋 Ce dont vous avez besoin

- ✅ Blender 5.0 ou supérieur (gratuit sur blender.org)
- ✅ Un modèle 3D simple (ex: contacteur, disjoncteur)
- ✅ 30 minutes de temps

---

## 🚀 Étape 1 : Ouvrir votre modèle

### 1.1 Lancer Blender

1. Ouvrez Blender 5
2. **File → Open** → Sélectionnez votre modèle `.blend`
3. Ou : **File → Import → glTF 2.0 (.glb)** si vous avez déjà un GLB

### 1.2 Organiser l'espace de travail

1. Cliquez sur **"Layout"** en haut (onglet par défaut)
2. Utilisez la **molette** pour zoomer/dézoomer
3. **Clic molette + glisser** pour tourner la vue
4. **Shift + clic molette** pour déplacer la vue

**💡 Astuce :** Appuyez sur `Numpad 7` pour vue de dessus, `Numpad 1` pour vue de face

![Blender Interface](https://docs.blender.org/manual/en/latest/_images/interface_window-system_introduction_default-startup.png)

---

## 🎨 Étape 2 : Créer une flèche (annotation)

### 2.1 Ajouter un cône (la flèche)

1. Appuyez sur **Shift + A** (menu Add)
2. **Mesh → Cone**
3. Un cône apparaît au centre de la scène

![Add Cone Menu](https://docs.blender.org/manual/en/latest/_images/modeling_meshes_primitives_cone_example.png)

### 2.2 Redimensionner la flèche

1. Appuyez sur **S** (Scale = échelle)
2. Tapez **0.05** puis **Entrée**
3. La flèche devient petite (adaptée à votre modèle)

### 2.3 Orienter la flèche vers le bas

1. Appuyez sur **R** (Rotate = rotation)
2. Appuyez sur **X** (axe X)
3. Tapez **90** puis **Entrée**
4. La flèche pointe maintenant vers le bas ⬇️

### 2.4 Positionner la flèche

1. Appuyez sur **G** (Grab = déplacer)
2. Déplacez la souris pour positionner sur la pièce à annoter
3. **Clic gauche** pour valider

**💡 Astuces de déplacement :**
- `G` puis `X` : déplacer sur l'axe X uniquement (rouge)
- `G` puis `Y` : déplacer sur l'axe Y uniquement (vert)
- `G` puis `Z` : déplacer sur l'axe Z uniquement (bleu)

---

## 📝 Étape 3 : Ajouter le texte

### 3.1 Créer un objet texte

1. **Shift + A**
2. **Text**
3. Un texte "Text" apparaît dans la scène

### 3.2 Modifier le texte

1. Appuyez sur **Tab** (mode édition)
2. **Ctrl + A** (sélectionner tout le texte)
3. Tapez votre texte : **"Borne L"**
4. Appuyez sur **Tab** (retour mode objet)

### 3.3 Agrandir le texte

1. Sélectionnez le texte
2. Panneau de droite → icône **"a"** (Text Properties)
3. **Size** : changez à **0.05**

### 3.4 Donner de l'épaisseur au texte (3D)

1. Toujours dans **Text Properties**
2. **Geometry → Extrude** : **0.005**
3. Le texte devient 3D ! 🎉

### 3.5 Centrer le texte

1. Toujours dans **Text Properties**
2. **Paragraph → Align** : **Center**

### 3.6 Positionner le texte

1. Appuyez sur **G**
2. Positionnez à côté de la flèche (5-10cm)
3. **Clic gauche** pour valider

---

## 🎨 Étape 4 : Colorier les annotations

### 4.1 Créer un matériau pour la flèche

1. Sélectionnez la flèche (cône)
2. Panneau de droite → icône **sphère** 🔴 (Shading)
3. Cliquez sur **"New"** (nouveau matériau)

### 4.2 Changer la couleur

1. **Base Color** : cliquez sur le carré blanc
2. Choisissez **JAUNE** (#FFFF00) pour bien voir
3. La flèche devient jaune 🟡

### 4.3 Faire briller la flèche (important !)

1. Descendez dans le panneau
2. **Emission Strength** : **1.5**
3. **Emission Color** : même jaune que Base Color
4. La flèche brille maintenant (visible même dans l'ombre)

### 4.4 Répéter pour le texte

1. Sélectionnez le texte
2. Même procédure que la flèche
3. Couleur : **BLANC** (#FFFFFF)
4. **Emission Strength** : **2.0**

**💡 Code couleur recommandé :**
- 🔴 **Rouge** : Borne L (Phase)
- 🔵 **Bleu** : Borne N (Neutre)
- 🟡 **Jaune/Vert** : Borne PE (Terre)
- 🟠 **Orange** : Bobine

---

## 📦 Étape 5 : Organiser avec une Collection

### 5.1 Créer une collection "Annotations"

1. Panneau de droite en haut → **Scene Collection** (icône dossier)
2. Clic droit sur **"Collection"**
3. **New Collection** → nommez **"Annotations"**

### 5.2 Déplacer flèche et texte dans la collection

1. Sélectionnez la flèche
2. **Glissez-la** dans la collection "Annotations"
3. Répétez pour le texte

**💡 Avantage :** Vous pouvez masquer/afficher toutes les annotations d'un coup avec l'icône œil 👁️

---

## 🔄 Étape 6 : Dupliquer pour d'autres annotations

### 6.1 Dupliquer la flèche

1. Sélectionnez la flèche
2. **Shift + D** (duplicate)
3. Déplacez à un nouvel endroit
4. **Clic gauche** pour valider

### 6.2 Dupliquer le texte

1. Sélectionnez le texte
2. **Shift + D**
3. Positionnez
4. **Tab** → modifiez le texte → **Tab**

**💡 Astuce :** Créez 3-4 annotations par modèle (pas trop pour ne pas surcharger)

**Exemple pour un contacteur :**
- Annotation 1 : Borne L (rouge)
- Annotation 2 : Borne N (bleu)
- Annotation 3 : Borne PE (jaune/vert)
- Annotation 4 : Bobine 24V (orange)

---

## 💾 Étape 7 : Exporter les 2 versions

### 7.1 Version SANS annotations

1. **Masquez** la collection "Annotations" (cliquez sur l'icône œil 👁️)
2. **File → Export → glTF 2.0 (.glb)**
3. Nom du fichier : **01-Contacteur.glb**
4. Cliquez sur **Export glTF 2.0**

### 7.2 Version AVEC annotations

1. **Affichez** la collection "Annotations" (cliquez sur l'icône œil 👁️)
2. **File → Export → glTF 2.0 (.glb)**
3. Nom du fichier : **01-Contacteur-annotated.glb**
4. **Options importantes** (panneau de droite) :
   - ✅ **Include → Selected Objects** (ou cochez "Visible Objects")
   - ✅ **Transform → +Y Up**
   - ✅ **Geometry → Apply Modifiers**
   - ✅ **Data → Custom Properties** (si vous en avez)
5. Cliquez sur **Export glTF 2.0**

**⚠️ Important :** Le nom doit contenir exactement **"-annotated"** avant l'extension !

---

## ✅ Étape 8 : Vérifier dans Garibobo RA

### 8.1 Upload sur GitHub

1. Placez les 2 fichiers dans **Cours/votre-dossier/**
2. Ouvrez Git Bash ou Terminal
3. ```bash
   git add Cours/
   git commit -m "Ajout modèle avec annotations"
   git push
   ```

### 8.2 Tester dans la PWA

1. Ouvrez votre PWA **Garibobo RA**
2. Chargez le modèle (version sans annotations s'affiche)
3. **Menu → Annotations** (bouton avec 👁️)
4. La version avec flèches/textes se charge automatiquement ! 🎉

### 8.3 Basculer entre les versions

- **Clic 1** : Affiche les annotations (icône 👁️)
- **Clic 2** : Masque les annotations (icône 🙈)

---

## 🎓 Exercice pratique : Annoter un contacteur

**Mission :** Créer 4 annotations sur un contacteur simple

### Annotation 1 : Borne L
- **Flèche** : Rouge, Emission 1.5
- **Position** : Dessus à gauche
- **Texte** : "Borne L - Phase 230V"

### Annotation 2 : Borne N
- **Flèche** : Bleue, Emission 1.5
- **Position** : Dessus à droite
- **Texte** : "Borne N - Neutre"

### Annotation 3 : Borne PE
- **Flèche** : Jaune/Vert, Emission 1.5
- **Position** : En bas au centre
- **Texte** : "Borne PE - Terre"

### Annotation 4 : Bobine
- **Flèche** : Orange, Emission 1.5
- **Position** : Sur le côté
- **Texte** : "Bobine 24V"

**Temps estimé :** 20-30 minutes

---

## 🔧 Raccourcis clavier essentiels

| Touche | Action | Description |
|--------|--------|-------------|
| `Shift + A` | Ajouter | Menu d'ajout d'objets |
| `G` | Déplacer | Grab (attraper) |
| `R` | Rotation | Tourner l'objet |
| `S` | Échelle | Scale (agrandir/rétrécir) |
| `Tab` | Mode | Basculer édition/objet |
| `Shift + D` | Dupliquer | Copier l'objet |
| `X` | Supprimer | Effacer l'objet |
| `Ctrl + Z` | Annuler | Revenir en arrière |
| `Numpad 7` | Vue dessus | Caméra de dessus |
| `Numpad 1` | Vue face | Caméra de face |
| `Numpad 3` | Vue côté | Caméra de côté |
| `Numpad 0` | Vue caméra | Vue de la caméra |

---

## ❓ Problèmes courants et solutions

### ❌ La flèche est trop grande
**Solution :** 
1. Sélectionnez la flèche
2. Appuyez sur `S` puis `0.05` puis `Entrée`

### ❌ Le texte est illisible (trop petit)
**Solution :**
1. Text Properties → Size : minimum **0.05**
2. Si encore trop petit : **0.1**

### ❌ Les annotations ne sont pas visibles dans le modèle
**Solution :**
1. Vérifiez que **Emission Strength** est à **1.5** minimum
2. Augmentez jusqu'à **3.0** si nécessaire

### ❌ L'export GLB est trop gros (>10 MB)
**Solution :**
1. File → Export → glTF 2.0
2. **Compression** → Cochez **Draco**
3. Cela réduit la taille de 50-70%

### ❌ Les annotations ne s'affichent pas dans la PWA
**Solution :**
1. Vérifiez le nom du fichier : doit contenir **"-annotated"**
2. Exemple correct : `modele-annotated.glb`
3. Exemple incorrect : `modele_annotated.glb` ou `modele-annote.glb`

### ❌ La flèche pointe dans la mauvaise direction
**Solution :**
1. Sélectionnez la flèche
2. `R` → `X` → `90` (rotation 90° sur axe X)
3. Ou `R` → `Y` → `90` (rotation 90° sur axe Y)
4. Ou `R` → `Z` → `90` (rotation 90° sur axe Z)

---

## 📚 Ressources supplémentaires

### Tutoriels Blender
- **Site officiel :** https://www.blender.org/support/tutorials/
- **Documentation Blender 5 :** https://docs.blender.org/
- **Forum Blender :** https://blenderartists.org/
- **YouTube :** Recherchez "Blender 5 tutorial français"

### Modèles 3D gratuits
- **Sketchfab :** https://sketchfab.com/ (modèles électriques)
- **TurboSquid :** https://www.turbosquid.com/
- **GrabCAD :** https://grabcad.com/ (modèles techniques)

### Convertir ce guide en PDF
1. **Avec Pandoc :** `pandoc GUIDE_ANNOTATIONS_BLENDER.md -o guide.pdf`
2. **Avec un outil en ligne :** https://www.markdowntopdf.com/
3. **Avec VS Code :** Extension "Markdown PDF"

---

## 📞 Support et contact

**Questions ou problèmes ?**

📧 **Email :** amir.garibovic@eduvaud.ch  
🌐 **Site :** https://garibobo.github.io/  
💻 **GitHub :** https://github.com/Garibobo/

---

## ✨ Récapitulatif rapide

1. ✅ **Ouvrir** votre modèle dans Blender 5
2. ✅ **Créer** une flèche (Cone) et la redimensionner (S → 0.05)
3. ✅ **Orienter** la flèche (R → X → 90)
4. ✅ **Ajouter** du texte (Shift+A → Text)
5. ✅ **Colorier** avec Emission (1.5-2.0)
6. ✅ **Organiser** dans une collection "Annotations"
7. ✅ **Dupliquer** pour d'autres annotations (Shift+D)
8. ✅ **Exporter** 2 versions : normale et -annotated
9. ✅ **Uploader** sur GitHub
10. ✅ **Tester** dans Garibobo RA

---

## 🎉 Félicitations !

Vous savez maintenant créer des **annotations 3D professionnelles** pour vos modèles électriques !

Vos élèves pourront :
- 📱 Voir les annotations en **réalité augmentée**
- 👁️ Basculer entre mode **exploration** et mode **apprentissage**
- 🎓 Apprendre de manière **interactive et visuelle**

**Bon travail et bonne création ! 🚀**

---

*Guide créé pour Garibobo RA - Domaine 3 Électricité*  
*Version 1.0 - Décembre 2024*  
*Par Amir Garibovic - EPSIC*

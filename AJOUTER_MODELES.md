# ➕ Guide : ajouter des modèles 3D, des PDF et des liens

Ce guide explique comment remplir la **Bibliothèque Réalité Augmentée** de Garibobo RA (V.1.57.0).
Tout se fait en déposant des fichiers dans le dossier `Cours/` du dépôt GitHub : **aucune ligne de code à modifier**.

---

## 📂 1. Structure du dossier `Cours/`

Le dossier `Cours/` se trouve **à la racine du dépôt** (à côté de `docs/`, pas dedans).

```text
Cours/
├── 01-FELLER/                     ← menu Feller (clic sur le dossier ou le logo Feller)
│   ├── Feller - site officiel.url
│   ├── 01-EDIZIO.liv/
│   │   ├── EDIZIO.liv - site Feller.url
│   │   ├── Fiche technique.pdf
│   │   └── 01-Cadre simple.glb
│   └── … (15 gammes)
├── 02-HAGER/
├── 03-LEGRAND/
├── …                              ← un dossier par fabricant (voir tableau ci-dessous)
├── 19-ZUMTOBEL/
└── Enseignement/                  ← icône 🎓, anciens cours
    ├── Electrotechnique/
    ├── Nibt/
    ├── Feller/
    └── …
```

### Dossiers fabricants

Chaque dossier contient un lien **« <Marque> - site officiel »** et un `.gitkeep`.

| Dossier | Affiché | Domaine |
|---|---|---|
| `01-FELLER` | FELLER | Appareillage (menu Feller avec les 15 gammes) |
| `02-HAGER` | HAGER | Tableaux, appareillage |
| `03-LEGRAND` | LEGRAND | Appareillage, tableaux |
| `04-ABB` | ABB | Disjoncteurs, FI, contacteurs, KNX |
| `05-SCHNEIDER ELECTRIC` | SCHNEIDER ELECTRIC | Tableaux industriels, automatisme |
| `06-EATON` | EATON | Distribution, disjoncteurs, relais |
| `07-WAGO` | WAGO | Bornes de raccordement (série 221) |
| `08-AGRO` | AGRO | Boîtes d'encastrement (groupe Kaiser) |
| `09-KAISER` | KAISER | Boîtes d'encastrement |
| `10-WOERTZ` | WOERTZ | Câbles plats, boîtes de dérivation |
| `11-PLICA` | PLICA | Tubes, presse-étoupes, fixations |
| `12-OBO BETTERMANN` | OBO BETTERMANN | Chemins de câbles, goulottes, foudre / surtension |
| `13-LANZ OENS` | LANZ OENS | Chemins de câbles, canalisations électriques |
| `14-THEBEN` | THEBEN | Détecteurs de présence, horloges, thermostats |
| `15-ZÜBLIN` | ZÜBLIN | Détecteurs de mouvement |
| `16-B.E.G` | B.E.G | Détecteurs de mouvement et de présence |
| `17-TULUX` | TULUX | Éclairage |
| `18-REGENT` | REGENT | Éclairage |
| `19-ZUMTOBEL` | ZUMTOBEL | Éclairage |

- Jusqu'à **5 niveaux de sous-dossiers** sont affichés.
- Un dossier vide n'existe pas sur GitHub : ajoutez-y un fichier vide `.gitkeep` pour le faire apparaître.
- Windows refuse un nom de dossier qui finit par un point : `16-B.E.G` (et non `16-B.E.G.`).
- Les modèles d'un dossier fabricant (et de `Enseignement/Feller`) affichent automatiquement la mention
  « Modèles 3D originaux © <fabricant> … usage strictement pédagogique ».
- **Nouveau fabricant** : créez le dossier `20-NOM/` avec un `.gitkeep`, puis ajoutez le nom dans `BRAND_OWNERS`
  (`docs/main.js`) pour que la mention de droits s'affiche.

---

## 🔢 2. Ordre d'affichage : les numéros « 01- »

GitHub classe les fichiers par ordre alphabétique. Pour choisir l'ordre, **préfixez les noms par un numéro** :

| Nom du fichier / dossier | Affiché comme |
|---|---|
| `01-Cadre simple.glb` | **Cadre simple** (partout) |
| `02-Cadre double.glb` | **Cadre double** |
| `03-EDIZIOdue colore/` (dans `01-FELLER`) | **EDIZIOdue colore** |
| `07-WAGO/` | **WAGO** |

- Les numéros sont **masqués à l'affichage** pour **tous les modèles `.glb` et tous les dossiers**.
- Utilisez toujours **2 chiffres** (`01-` … `15-`) pour que `10-` ne passe pas avant `02-`.

Dans chaque dossier, les éléments apparaissent toujours dans cet ordre :

1. 🔗 **Liens** (fichiers `.url`)
2. 📄 **PDF**
3. 🤖 **Modèles 3D** (`.glb`)
4. 📁 **Sous-dossiers**

---

## 🧊 3. Les modèles 3D : un seul fichier `.glb`

**Un seul fichier `.glb` par modèle suffit** pour toutes les plateformes :

| Appareil | Vue 3D | Réalité augmentée |
|---|---|---|
| 💻 PC (Chrome, Edge, Brave, Firefox) | ✅ | — (RA uniquement sur mobile) |
| 🤖 Android | ✅ | ✅ Scene Viewer ou WebXR (⚙️ Options → Mode RA) |
| 🍎 iPhone / iPad | ✅ | ✅ Quick Look (conversion automatique du `.glb`) |

### Règles importantes

- **Unité = mètre** : dans Blender, 1 unité = 1 m. Un cadre Feller doit mesurer 0,088 m, sinon les **cotes** (📏 Dimensions), la **mesure entre 2 points** et le bouton **1:1 Taille réelle** affichent de mauvaises valeurs.
- **Taille du fichier** : visez moins de **10–15 Mo** pour un chargement rapide sur smartphone.
- **Nom du fichier** = nom affiché (sans le numéro et sans `.glb`).
- Les **animations** contenues dans le `.glb` démarrent automatiquement (bouton ⏸️ Pause).

### `.usdz` : facultatif

Un fichier `.usdz` n'est **plus nécessaire** : l'iPhone convertit le `.glb` automatiquement.
Vous pouvez quand même en ajouter un (meilleure qualité sur iPhone) :

- **même nom** que le `.glb`, **même dossier** : `01-Cadre simple.glb` + `01-Cadre simple.usdz`
- il n'apparaît pas dans le menu ;
- il est utilisé seulement pour la **couleur par défaut** (pour les autres couleurs, la conversion automatique reprend la main).

### 🎨 Variantes de couleurs : détectées automatiquement

Si le `.glb` contient plusieurs couleurs (extension glTF **KHR_materials_variants**), le sélecteur **🎨 Couleur** apparaît tout seul sous le lecteur.

- Dans Blender : panneau **glTF Material Variants** (exportateur glTF), une variante par couleur, puis export en `.glb`.
- Le **nom de la variante** est le nom affiché sur la pastille (ex. « Blanc », « Noir », « Gris clair »).
- En RA : couleur choisie sur iPhone ; sur Android en **Mode RA : Web**, bandeau de couleurs directement en RA.

### 👁️ Version annotée (facultatif)

Ajoutez une deuxième version du modèle avec `-annotated` dans le nom :
`moteur.glb` + `moteur-annotated.glb`. Le bouton **⚙️ Options → Annotations** passe de l'une à l'autre
(voir `GUIDE_ANNOTATIONS_BLENDER.md`). La version annotée n'apparaît pas dans le menu ni dans la recherche.

---

## 🔗 4. Les liens Internet : fichiers `.url`

Pour ajouter un lien (site du fabricant, vidéo YouTube…) dans un dossier :

1. Ouvrez la page dans votre navigateur (Chrome, Edge…).
2. **Glissez le cadenas** 🔒 (à gauche de l'adresse) dans le dossier voulu de l'Explorateur Windows.
3. Un fichier raccourci `.url` est créé : **renommez-le** avec le texte à afficher, ex. `EDIZIO.liv - site Feller.url`.

- Le lien apparaît **tout en haut** du dossier avec 🔗 (ou ▶️ pour YouTube / Vimeo) et s'ouvre dans un nouvel onglet.
- Seuls les liens `http://` et `https://` sont affichés.

---

## 📄 5. Les PDF : affichés automatiquement

Déposez simplement le fichier `.pdf` dans le dossier :

- il apparaît avec 📄, juste après les liens ;
- les `_` du nom sont remplacés par des espaces (`Fiche_technique.pdf` → « Fiche technique ») ;
- PC et iPhone : ouverture dans un nouvel onglet ; Android : ouverture dans l'application PDF du téléphone.

---

## 🎓 6. Quiz d'un modèle (facultatif)

Le bouton **⚙️ Options → Quiz interactif** propose toujours un **quiz automatique** (cotes, nombre de couleurs, couleur disponible, animation).

Pour poser **vos propres questions**, ajoutez à côté du modèle un fichier **`<nom du modèle>.quiz.json`** :
`01-Cadre simple.glb` + `01-Cadre simple.quiz.json`

```json
{
  "questions": [
    {
      "question": "Quelle est la largeur de ce cadre ?",
      "choix": ["71 mm", "88 mm", "120 mm"],
      "reponse": 1,
      "explication": "Le cadre mesure 88 mm : vérifiez avec le bouton 📏 Dimensions."
    },
    {
      "question": "Combien de couleurs sont proposées ?",
      "choix": ["4", "8", "12"],
      "reponse": "12",
      "explication": "Le sélecteur 🎨 Couleur affiche les 12 couleurs."
    }
  ]
}
```

- `reponse` : **numéro** du bon choix (`0` = 1er choix) **ou** le **texte** exact du bon choix.
- `explication` : facultative, affichée après la réponse.
- Au moins 2 choix par question. Le fichier doit être enregistré en **UTF-8** (accents).
- Le fichier `.quiz.json` n'apparaît pas dans le menu.

---

## ⏱️ 7. Quand les nouveaux fichiers apparaissent-ils ?

1. Copiez les fichiers dans le dépôt de publication et **poussez** avec GitHub Desktop.
2. La liste des cours est lue sur GitHub **en une seule fois** puis **gardée 1 heure** sur chaque appareil
   (GitHub limite à 60 consultations par heure et par réseau : tout l'établissement partage cette limite).
3. Un appareil qui a déjà ouvert le site voit donc les nouveautés **au plus tard 1 heure après**.
   Pour les voir tout de suite : ouvrez le site dans une **fenêtre de navigation privée**.

Si le message **« ⚠️ Liste des cours indisponible »** apparaît : la limite GitHub est atteinte sur ce réseau.
Attendez le délai indiqué puis touchez **🔄 Réessayer**. Les appareils qui ont déjà ouvert le site continuent
d'afficher leur dernière liste.

---

## 🧪 8. Tester un modèle sans le publier : bouton « ➕ Ajouter un modèle »

Le bouton **➕** à droite de la barre de recherche permet d'ouvrir un `.glb` **sans le mettre sur GitHub** :

- **📁 Depuis votre appareil** : choisissez un fichier `.glb` (PC, Android, iPhone) ;
- **🔗 Depuis une URL** : collez un lien direct vers un `.glb` (le serveur doit autoriser CORS).

Le modèle n'est pas enregistré : il disparaît au rechargement de la page et ne peut pas être ajouté aux favoris.
Sur Android, la RA d'un fichier local passe par WebXR.

Modèles de test : `https://modelviewer.dev/shared-assets/models/Astronaut.glb`

---

## 🔍 9. Retrouver un modèle

- **🔍 Rechercher un cours** (sous le titre) : cherche dans **tous les dossiers** les modèles et les PDF dont le
  nom ou le dossier contient le texte (dès 2 lettres, accents ignorés).
- **⬅️ Retour à l'accueil**, le **logo** ou le **titre Garibobo RA** : retour à l'état initial.
- **Poignée** entre le menu et le lecteur : glisser pour élargir le menu (double-clic : largeur par défaut).

---

## ✅ Checklist d'ajout

- [ ] Modèle exporté en **`.glb`**, unité = **mètre**, moins de 15 Mo
- [ ] Nom avec numéro d'ordre : `01-Nom du modèle.glb`
- [ ] Couleurs en variantes glTF (facultatif, détectées automatiquement)
- [ ] `.usdz` de même nom (facultatif)
- [ ] `-annotated.glb` (facultatif) et `.quiz.json` (facultatif)
- [ ] Liens en `.url` (glisser le cadenas), PDF déposés tels quels
- [ ] Dossier vide → `.gitkeep`
- [ ] Copie dans le dépôt de publication + push avec GitHub Desktop
- [ ] Vérification en navigation privée (PC), puis sur Android et iPhone

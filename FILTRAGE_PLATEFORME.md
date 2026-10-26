# 📱 Plateformes : un seul `.glb` pour tous les appareils

## ✅ Principe (depuis V.1.53)

Il n'y a **plus de filtrage par plateforme** : tous les appareils voient **les mêmes modèles**, à partir d'**un seul
fichier `.glb`**. L'ancien système (`.glb` visible sur Android, `.usdz` visible sur iOS) est abandonné.

| Appareil | Ce qui est affiché | Réalité augmentée |
| --- | --- | --- |
| 💻 PC | Modèles `.glb`, liens, PDF | — (message : RA disponible sur smartphone ou tablette) |
| 🤖 Android | Idem | **Scene Viewer** (Mode RA : Natif) ou **WebXR** (Mode RA : Web) |
| 🍎 iPhone / iPad | Idem | **Quick Look** : le `.glb` est converti automatiquement en `.usdz` |

Les fichiers `.usdz` ne sont **jamais affichés** dans le menu : ce sont des compagnons **facultatifs**.

---

## 🔧 Détection de la plateforme

Au démarrage, `detectPlatform()` (dans `docs/main.js`) lit le *user agent* et affiche un message dans l'accueil :

- 🤖 **Android détecté** — Réalité augmentée via Scene Viewer ou WebXR (⚙️ Options → Mode RA)
- 🍎 **iOS détecté** — Réalité augmentée via Quick Look (conversion automatique du modèle)
- 💻 **Desktop détecté** — Viewer 3D interactif (RA disponible sur mobile)

La plateforme sert seulement à adapter la **réalité augmentée** et quelques boutons, pas à filtrer les fichiers.
Sur **Samsung Internet**, le lecteur passe en `touch-action="none"` pour que le zoom à deux doigts agisse sur le modèle.

---

## 🤖 Android : deux modes de RA (⚙️ Options → Mode RA)

| | **Natif** (par défaut) | **Web** |
| --- | --- | --- |
| Moteur | Scene Viewer (Google) | WebXR dans le navigateur |
| Pourcentage de taille | ✅ affiché par Scene Viewer | ✅ affiché à gauche (« 100 % réel » en vert) |
| Bouton 1:1 Taille réelle | — | ✅ colonne de gauche |
| Bouton 📏 Dimensions en RA | — | ✅ colonne de gauche |
| Changer de couleur en RA | ❌ couleur par défaut | ✅ bandeau de couleurs en bas |
| Éclairage « Réaliste » | — | ✅ lumière de la pièce estimée |

Le choix est mémorisé sur l'appareil. Un fichier ouvert depuis l'appareil (bouton ➕) passe toujours par WebXR.

---

## 🍎 iPhone / iPad : `.usdz` facultatif

- Sans `.usdz` : model-viewer convertit le `.glb` **avec la couleur affichée** au moment du clic sur « Voir en Réalité augmentée ».
- Avec un `.usdz` compagnon (**même nom, même dossier**) : il est utilisé pour la **couleur par défaut** uniquement.
- Utilisez **Safari** pour la meilleure expérience 3D (un avertissement s'affiche dans Chrome sur iPhone).

```text
Cours/01-FELLER/01-EDIZIO.liv/
├── 01-Cadre simple.glb     ← affiché dans le menu (toutes plateformes)
└── 01-Cadre simple.usdz    ← facultatif, jamais affiché, utilisé par l'iPhone (couleur par défaut)
```

---

## 📂 Ce que voit chaque appareil

Pour ce dossier :

```text
Cours/Enseignement/Electrotechnique/
├── Cours moteur - vidéo.url
├── Fiche_moteur.pdf
├── 01-moteur.glb
├── 01-moteur.usdz
├── 01-moteur-annotated.glb
└── 01-moteur.quiz.json
```

**PC, Android et iPhone affichent la même chose :**

```text
🎓 Enseignement
  └── 📁 Electrotechnique
        ├── ▶️ Cours moteur - vidéo
        ├── 📄 Fiche moteur
        └── 🤖 moteur
```

`.usdz`, `-annotated.glb` et `.quiz.json` ne sont pas listés : ils sont utilisés automatiquement
(RA iPhone, ⚙️ Options → Annotations, ⚙️ Options → Quiz interactif).

---

## 🎨 Couleurs, liens, PDF : identiques partout

- **Variantes de couleurs** (`KHR_materials_variants`) détectées automatiquement dans le `.glb` → sélecteur 🎨 Couleur.
- **Liens** : fichiers `.url` (glisser le cadenas du navigateur dans le dossier).
- **PDF** : affichés automatiquement (nouvel onglet sur PC/iPhone, application PDF sur Android).
- **Numéros `01-`** : fixent l'ordre, masqués à l'affichage (modèles et dossiers).
- **Dossiers fabricants** (`01-FELLER` … `19-ZUMTOBEL`) : mention de droits du fabricant sous le lecteur.

Détails : voir `AJOUTER_MODELES.md`.

---

## 📱 Affichage selon la taille de l'écran

| Écran | Mise en page |
| --- | --- |
| PC (> 768 px) | Menu à gauche (poignée pour l'élargir), lecteur sur toute la hauteur, tous les boutons visibles |
| ≥ 1400 px | Interface et textes d'accueil un peu plus grands |
| Smartphone portrait (≤ 768 px) | Menu étroit à gauche, lecteur au milieu ; boutons secondaires dans ⚙️ Options ; ☰ masque le menu |
| Smartphone paysage (hauteur ≤ 500 px) | En-têtes réduits, titre masqué, boutons dans ⚙️ Options |

Le **zoom de la page à deux doigts** est autorisé (hors du lecteur 3D, où le pincement zoome le modèle).

---

## 🧪 Tests recommandés après chaque publication

1. **PC** (Chrome / Edge) : ouvrir un dossier, un modèle, 📏 Dimensions, ⚙️ Options (mesure, éclairage, quiz).
2. **Android** (Chrome et Samsung Internet) : Mode RA Natif puis Web, 1:1 Taille réelle, couleurs en RA.
3. **iPhone** (Safari) : vue 3D, couleur choisie puis « Voir en Réalité augmentée ».
4. Console (F12 sur PC) : `📱 Plateforme détectée: …`, `🔍 Arborescence: …`, `📏 Dimensions: …`.

---

## 🐛 Dépannage

| Problème | Solution |
| --- | --- |
| « ⚠️ Liste des cours indisponible » | Limite GitHub (60 consultations / heure / réseau) : attendre le délai indiqué puis 🔄 Réessayer |
| Nouveau modèle invisible | Liste gardée 1 h sur l'appareil : attendre ou ouvrir en navigation privée |
| Cotes ou taille réelle fausses | Le modèle n'est pas en mètres : corriger l'échelle dans Blender (1 unité = 1 m) |
| Pas de sélecteur de couleurs | Le `.glb` ne contient pas de variantes `KHR_materials_variants` |
| RA indisponible sur Android | Installer / mettre à jour « Services Google Play pour la RA » (ARCore) |
| Ancienne version affichée | Recharger deux fois (mise à jour du cache Service Worker) |

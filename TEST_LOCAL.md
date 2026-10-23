# 🧪 Test Local et Ajout de Modèles

## ✅ Corrections apportées

Le système de navigation a été complètement recodé pour être **vraiment dynamique** :

- ✅ **Détection automatique** du repo GitHub
- ✅ **Scan via API GitHub** pour lister tous les fichiers
- ✅ **Navigation interactive** : cliquez sur les dossiers pour les ouvrir/fermer
- ✅ **Chargement à la demande** : les sous-dossiers se chargent quand vous cliquez
- ✅ **Cache intelligent** : évite de recharger les mêmes dossiers
- ✅ **Indentation visuelle** : 20px par niveau de profondeur

## 📱 Comment tester sur votre Android Fold 4

### 1. Pushez les modifications

```powershell
# Dans GitHub Desktop
1. Vous verrez les changements dans main.js
2. Commit : "Fix navigation dynamique"
3. Push origin
```

### 2. Attendez le déploiement (2-3 minutes)

### 3. Testez sur votre mobile

1. Ouvrez Chrome sur votre Fold 4
2. Allez sur : `https://VOTRE_USERNAME.github.io/Garibobo-RA/`
3. **Ouvrez la console** (pour debug) :
   - Menu Chrome > Plus d'outils > Outils de développement
   - Ou utilisez Chrome Remote Debugging depuis votre PC

### 4. Vérifiez dans la console

Vous devriez voir :

```text
📦 Repo détecté: VOTRE_USERNAME/Garibobo-RA
🔍 Scan: https://api.github.com/repos/...
```

## 📦 Ajouter des modèles 3D pour tester

### Option 1 : Modèles de test gratuits

Téléchargez ces modèles GLB gratuits :

1. **Sketchfab** (recommandé)
   - <https://sketchfab.com/3d-models/electric-motor-animated>
   - Cliquez sur "Download 3D Model"
   - Format : glTF Binary (.glb)

2. **Poly Pizza**
   - <https://poly.pizza/>
   - Cherchez "motor" ou "transformer"
   - Téléchargez en .glb

### Option 2 : Créer un modèle simple avec Blender

```text
1. Ouvrez Blender
2. Créez un cube (déjà présent par défaut)
3. File > Export > glTF 2.0 (.glb)
4. Nommez : test-cube.glb
```

### Option 3 : Utiliser un modèle de démonstration

Téléchargez ce modèle officiel Google :

- <https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Box/glTF-Binary>
- Fichier : `Box.glb`

## 📂 Structure pour ajouter des modèles

### Exemple 1 : Modèle simple

```text
docs/Cours/Electrotechnique/
└── moteur.glb
```

### Exemple 2 : Avec sous-dossiers

```text
docs/Cours/Electrotechnique/
├── Moteurs/
│   ├── moteur-asynchrone.glb
│   └── moteur-synchrone.glb
└── Transformateurs/
    ├── transfo-monophase.glb
    └── transfo-triphase.glb
```

### Exemple 3 : Avec iOS (USDZ)

```text
docs/Cours/Electrotechnique/
├── moteur.glb      ← Pour Android
└── moteur.usdz     ← Pour iOS
```

## 🔧 Convertir GLB en USDZ (pour iOS)

### Option 1 : Reality Converter (Mac uniquement)

1. Téléchargez Reality Converter (gratuit)
2. Glissez votre fichier .glb
3. Exportez en .usdz

### Option 2 : En ligne

1. <https://www.vectary.com/3d-modeling-news/usdz-converter/>
2. Uploadez votre .glb
3. Téléchargez le .usdz

### Option 3 : Blender + Plugin

1. Installez le plugin USD pour Blender
2. Importez votre .glb
3. Exportez en .usdz

## 🧪 Test complet

### 1. Ajoutez un modèle de test

```powershell
# Copiez un fichier GLB dans :
docs/Cours/Electrotechnique/test.glb
```

### 2. Commitez et pushez

```powershell
# GitHub Desktop
1. Vous verrez "test.glb" dans les changements
2. Commit : "Ajout modèle de test"
3. Push
```

### 3. Testez sur mobile (après 2-3 min)

1. Ouvrez la PWA
2. Cliquez sur **"Electrotechnique"** ▶
3. Le dossier s'ouvre ▼
4. Vous devriez voir **"📦 test"**
5. Cliquez dessus
6. Le modèle 3D s'affiche !

## 🐛 Dépannage

### Les dossiers ne s'ouvrent pas

**Vérifiez dans la console** (F12) :

- Si vous voyez `⚠️ API GitHub non disponible` → L'API a une limite de taux
- Solution : Attendez 1 heure ou ajoutez un token GitHub

### Je ne vois aucun fichier

**Vérifications** :

1. Les fichiers sont bien dans `docs/Cours/...` (pas à la racine)
2. Les extensions sont `.glb` ou `.usdz` (minuscules)
3. Le push GitHub est terminé (vérifiez sur github.com)

### L'API GitHub est limitée

L'API GitHub a une limite de **60 requêtes/heure** sans authentification.

**Solution temporaire** : Attendez 1 heure

**Solution permanente** : Ajoutez un token GitHub (je peux vous montrer comment)

## 📊 Limites de l'API GitHub

- ⚠️ **60 requêtes/heure** sans authentification
- ✅ **5000 requêtes/heure** avec token
- ✅ Cache intelligent pour limiter les appels

## 🚀 Prochaines améliorations possibles

Si l'API GitHub pose problème, je peux créer :

1. **Fichier manifest.json** : Liste statique de tous vos modèles
2. **Script de génération** : Scan local et génération automatique
3. **Token GitHub** : Augmenter la limite à 5000 req/h

---

## ✅ Résumé des changements

- ✅ Navigation dynamique fonctionnelle
- ✅ Clic sur dossier = ouvrir/fermer
- ✅ Scan automatique via API GitHub
- ✅ Affichage des fichiers .glb et .usdz
- ✅ Indentation visuelle par niveau
- ✅ Cache pour performance

**Pushez maintenant et testez sur votre Fold 4 ! 🚀**

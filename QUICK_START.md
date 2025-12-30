# 🚀 Quick Start - Garibobo RA

Guide rapide pour démarrer en 5 minutes.

## 📋 Étapes rapides

### 1️⃣ Créer le repository GitHub

```bash
cd Garibobo-RA
git init
git add .
git commit -m "Initial commit"
```

### 2️⃣ Pousser sur GitHub

```bash
# Créez d'abord le repo sur github.com
git remote add origin https://github.com/VOTRE_USERNAME/Garibobo-RA.git
git branch -M main
git push -u origin main
```

### 3️⃣ Activer GitHub Pages

1. **Settings** > **Pages**
2. Source : **main** → Dossier : **/docs**
3. **Save**

### 4️⃣ Accéder à votre PWA

```
https://VOTRE_USERNAME.github.io/Garibobo-RA/
```

## 📦 Ajouter des modèles 3D

### Formats requis

- **`.glb`** pour Android
- **`.usdz`** pour iOS

### Où les placer

```bash
# Exemple
docs/Cours/Electrotechnique/
├── transformateur.glb
└── transformateur.usdz
```

### Pousser les changements

```bash
git add .
git commit -m "Ajout modèles 3D"
git push
```

**C'est tout ! Les modèles apparaissent automatiquement.**

## 🎨 Personnaliser les icônes

1. Créez `icon-192.png` (192x192px)
2. Créez `icon-512.png` (512x512px)
3. Placez-les dans `docs/icons/`
4. Push sur GitHub

## 📱 Installer sur mobile

### Android (Chrome)

Menu (⋮) > **Installer l'application**

### iOS (Safari)

Partager (□↑) > **Sur l'écran d'accueil**

## 🔄 Convertir GLB → USDZ

### Mac

[Reality Converter](https://developer.apple.com/augmented-reality/tools/)

### Windows/Linux

[Blender](https://www.blender.org/) : Import GLB > Export USDZ

## 📚 Documentation complète

- **README.md** - Vue d'ensemble
- **GUIDE_COMPLET.md** - Guide détaillé
- **docs/Cours/README.md** - Organisation des cours

## ❓ Problèmes courants

### Les modèles ne s'affichent pas

- Vérifiez les extensions : `.glb` et `.usdz`
- Vérifiez les chemins dans `docs/Cours/`

### L'AR ne fonctionne pas

- **Android** : Utilisez Chrome + fichier `.glb`
- **iOS** : Utilisez Safari + fichier `.usdz`

### La PWA ne s'installe pas

- Vérifiez que les icônes existent dans `docs/icons/`
- Attendez 2-3 minutes après activation GitHub Pages

---

**🎓 Prêt à démarrer ! Consultez GUIDE_COMPLET.md pour plus de détails.**

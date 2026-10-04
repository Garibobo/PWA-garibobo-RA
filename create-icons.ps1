# Script pour créer les icônes PWA
# Nécessite ImageMagick : https://imagemagick.org/script/download.php

$sourceImage = "docs/icons/source-image.png"  # Placez votre image ici
$outputDir = "docs/icons"

Write-Host "🎨 Création des icônes PWA..." -ForegroundColor Cyan

# Vérifier si ImageMagick est installé
try {
    $magickVersion = magick --version
    Write-Host "✅ ImageMagick détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick n'est pas installé" -ForegroundColor Red
    Write-Host "Téléchargez-le sur : https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    exit 1
}

# Vérifier si l'image source existe
if (-not (Test-Path $sourceImage)) {
    Write-Host "❌ Image source non trouvée : $sourceImage" -ForegroundColor Red
    Write-Host "Placez votre image dans docs/icons/source-image.png" -ForegroundColor Yellow
    exit 1
}

# Créer icon-192.png
Write-Host "📦 Création de icon-192.png..." -ForegroundColor Yellow
magick convert $sourceImage -resize 192x192 "$outputDir/icon-192.png"

# Créer icon-512.png
Write-Host "📦 Création de icon-512.png..." -ForegroundColor Yellow
magick convert $sourceImage -resize 512x512 "$outputDir/icon-512.png"

Write-Host ""
Write-Host "✅ Icônes créées avec succès !" -ForegroundColor Green
Write-Host "📁 Emplacement : $outputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fichiers créés :" -ForegroundColor White
Write-Host "  - icon-192.png (192x192)" -ForegroundColor Gray
Write-Host "  - icon-512.png (512x512)" -ForegroundColor Gray

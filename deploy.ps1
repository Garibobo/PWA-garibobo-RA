# Script de déploiement Garibobo RA
# Automatise le push vers GitHub

Write-Host "🚀 Déploiement Garibobo RA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git n'est pas initialisé" -ForegroundColor Red
    Write-Host "Exécutez d'abord:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/VOTRE_USERNAME/Garibobo-RA.git" -ForegroundColor Yellow
    exit 1
}

# Demander le message de commit
$commitMessage = Read-Host "📝 Message de commit (ou Entrée pour 'Update')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update"
}

Write-Host ""
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow
git add .

Write-Host "💾 Commit..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host "🌐 Push vers GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Votre PWA sera disponible dans 2-3 minutes à:" -ForegroundColor Cyan
Write-Host "   https://VOTRE_USERNAME.github.io/Garibobo-RA/" -ForegroundColor White
Write-Host ""
Write-Host "💡 N'oubliez pas d'activer GitHub Pages:" -ForegroundColor Yellow
Write-Host "   Settings > Pages > Source: main > Folder: /docs" -ForegroundColor White
Write-Host ""

# Script PowerShell pour convertir le guide Markdown en PDF
# Par Amir Garibovic - Garibobo RA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Conversion Guide Blender en PDF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$markdownFile = "GUIDE_ANNOTATIONS_BLENDER.md"
$htmlFile = "GUIDE_ANNOTATIONS_BLENDER.html"
$pdfFile = "GUIDE_ANNOTATIONS_BLENDER.pdf"

# Vérifier si le fichier Markdown existe
if (-not (Test-Path $markdownFile)) {
    Write-Host "❌ Erreur : Le fichier $markdownFile n'existe pas !" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le bon dossier." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "📄 Fichier trouvé : $markdownFile" -ForegroundColor Green
Write-Host ""

# Méthode 1 : Essayer avec Pandoc (si installé)
Write-Host "🔍 Vérification de Pandoc..." -ForegroundColor Yellow
$pandocInstalled = Get-Command pandoc -ErrorAction SilentlyContinue

if ($pandocInstalled) {
    Write-Host "✅ Pandoc trouvé ! Conversion en cours..." -ForegroundColor Green
    try {
        pandoc $markdownFile -o $pdfFile --pdf-engine=wkhtmltopdf
        if (Test-Path $pdfFile) {
            Write-Host "✅ PDF créé avec succès : $pdfFile" -ForegroundColor Green
            Write-Host ""
            Write-Host "📂 Ouverture du PDF..." -ForegroundColor Cyan
            Start-Process $pdfFile
            exit
        }
    } catch {
        Write-Host "⚠️ Erreur avec Pandoc, essai d'une autre méthode..." -ForegroundColor Yellow
    }
}

# Méthode 2 : Conversion via HTML puis ouverture dans navigateur
Write-Host "📝 Conversion en HTML..." -ForegroundColor Yellow

# Lire le contenu Markdown
$content = Get-Content $markdownFile -Raw -Encoding UTF8

# Créer un HTML simple avec style
$html = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide Blender - Annotations 3D</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #1976D2;
            border-bottom: 3px solid #1976D2;
            padding-bottom: 10px;
        }
        h2 {
            color: #1976D2;
            margin-top: 30px;
            border-left: 4px solid #1976D2;
            padding-left: 10px;
        }
        h3 {
            color: #555;
            margin-top: 20px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #1976D2;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .emoji {
            font-size: 1.2em;
        }
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
            h1, h2 {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
<div id="content">
$($content -replace '```', '<pre><code>' -replace '```', '</code></pre>' -replace '#{1,6}\s+(.+)', '<h2>$1</h2>' -replace '\*\*(.+?)\*\*', '<strong>$1</strong>' -replace '\*(.+?)\*', '<em>$1</em>' -replace '`(.+?)`', '<code>$1</code>' -replace '\n\n', '<br><br>')
</div>

<script>
    // Bouton pour imprimer en PDF
    window.onload = function() {
        const printBtn = document.createElement('button');
        printBtn.textContent = '🖨️ Imprimer en PDF';
        printBtn.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #1976D2; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; z-index: 1000;';
        printBtn.onclick = function() {
            window.print();
        };
        document.body.appendChild(printBtn);
    };
</script>
</body>
</html>
"@

# Sauvegarder le HTML
$html | Out-File -FilePath $htmlFile -Encoding UTF8

Write-Host "✅ Fichier HTML créé : $htmlFile" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTRUCTIONS POUR CRÉER LE PDF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le fichier HTML va s'ouvrir dans votre navigateur." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Pour créer le PDF :" -ForegroundColor White
Write-Host "  1. Cliquez sur le bouton '🖨️ Imprimer en PDF' en haut à droite" -ForegroundColor White
Write-Host "  2. OU appuyez sur Ctrl + P" -ForegroundColor White
Write-Host "  3. Sélectionnez 'Microsoft Print to PDF' ou 'Enregistrer au format PDF'" -ForegroundColor White
Write-Host "  4. Cliquez sur 'Enregistrer'" -ForegroundColor White
Write-Host "  5. Nommez le fichier : GUIDE_ANNOTATIONS_BLENDER.pdf" -ForegroundColor White
Write-Host ""
Write-Host "📂 Ouverture du fichier HTML dans le navigateur..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process $htmlFile

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green
Write-Host ""
pause
"@

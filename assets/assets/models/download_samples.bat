@echo off
echo Téléchargement des modèles 3D d'exemple pour Garibobo RA...
echo.

REM Créer les dossiers
mkdir basic 2>nul
mkdir complex 2>nul
mkdir textures 2>nul

echo Téléchargement des modèles GLB depuis Khronos glTF-Sample-Models...
echo.

REM Modèles de base (GLB - Format recommandé)
echo [1/6] Téléchargement Duck.glb...
curl -L -o "basic\Duck.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Duck/glTF-Binary/Duck.glb"

echo [2/6] Téléchargement Box.glb...
curl -L -o "basic\Box.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Box/glTF-Binary/Box.glb"

echo [3/6] Téléchargement Sphere.glb...
curl -L -o "basic\Sphere.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Sphere/glTF-Binary/Sphere.glb"

echo [4/6] Téléchargement Suzanne.glb...
curl -L -o "basic\Suzanne.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Suzanne/glTF-Binary/Suzanne.glb"

REM Modèles complexes
echo [5/6] Téléchargement Avocado.glb...
curl -L -o "complex\Avocado.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Avocado/glTF-Binary/Avocado.glb"

echo [6/6] Téléchargement FlightHelmet.glb...
curl -L -o "complex\FlightHelmet.glb" "https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb"

echo.
echo ✅ Téléchargement terminé !
echo.
echo Modèles disponibles dans assets/models/ :
echo   📁 basic/
echo     - Duck.glb (canard - déjà utilisé dans le code)
echo     - Box.glb (cube simple)
echo     - Sphere.glb (sphère)
echo     - Suzanne.glb (tête de singe Blender)
echo   📁 complex/
echo     - Avocado.glb (avocat avec textures)
echo     - FlightHelmet.glb (casque détaillé)
echo.
echo 🚀 Vous pouvez maintenant tester ces modèles dans Garibobo RA !
echo.
pause

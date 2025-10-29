#!/bin/bash

# Script de instalación para CI/CD Local
# Instala dependencias necesarias para correr el CI/CD localmente

set -e

echo "🔧 Instalando dependencias para CI/CD Local..."
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    IS_WINDOWS=1
    echo "📝 Sistema detectado: Windows"
else
    IS_WINDOWS=0
    echo "📝 Sistema detectado: Unix/Linux"
fi

echo ""
echo "1️⃣ Instalando chalk (para colores en logs)..."
npm install --save-dev chalk

echo ""
echo "2️⃣ Instalando chokidar (para watch mode)..."
npm install --save-dev chokidar

echo ""
echo "✅ Dependencias instaladas correctamente"
echo ""
echo "🚀 Ahora puedes correr:"
echo ""
if [ $IS_WINDOWS -eq 1 ]; then
    echo "   node ci-cd-local.js              # Build frontend + backend"
    echo "   node ci-cd-local.js --front      # Solo frontend"
    echo "   node ci-cd-local.js --back       # Solo backend"
    echo "   node ci-cd-local.js --watch      # Modo watch (recompila en cambios)"
else
    echo "   ./ci-cd-local.sh              # Build frontend + backend"
    echo "   ./ci-cd-local.sh --front      # Solo frontend"
    echo "   ./ci-cd-local.sh --back       # Solo backend"
    echo "   ./ci-cd-local.sh --watch      # Modo watch (recompila en cambios)"
fi
echo ""

#!/bin/bash

# ================================================================
# Script de Instalación - Sistema de Indicadores Económicos
# ================================================================

echo "🚀 Instalando Sistema de Indicadores Económicos..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio ccbackend"
    exit 1
fi

# Paso 1: Instalar dependencias de Node.js
echo "📦 Paso 1: Instalando dependencias de Node.js..."
npm install axios node-cron

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""

# Paso 2: Aplicar migración de base de datos
echo "🗄️  Paso 2: Aplicando migración de base de datos..."
echo "Por favor, ejecuta el siguiente comando en tu cliente MySQL:"
echo ""
echo "mysql -u tu_usuario -p cuentasclaras < migrations/add_indicadores_economicos.sql"
echo ""
echo "O si usas phpMyAdmin:"
echo "1. Abre phpMyAdmin"
echo "2. Selecciona la base de datos 'cuentasclaras'"
echo "3. Ve a la pestaña 'SQL'"
echo "4. Copia y pega el contenido de migrations/add_indicadores_economicos.sql"
echo "5. Ejecuta la consulta"
echo ""

# Paso 3: Verificar archivos creados
echo "📋 Paso 3: Verificando archivos del sistema..."

FILES=(
    "src/services/indicadoresService.js"
    "src/services/schedulerService.js"
    "migrations/add_indicadores_economicos.sql"
    "sql/indicadores_tables.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (FALTANTE)"
    fi
done

echo ""

# Paso 4: Instrucciones finales
echo "🎯 Pasos finales:"
echo ""
echo "1. ✅ Dependencias instaladas (axios, node-cron)"
echo "2. 🗄️  Aplica la migración SQL (ver instrucciones arriba)"
echo "3. 🔄 Reinicia el servidor: npm start"
echo "4. 🧪 Opcional: Ejecuta sincronización inicial:"
echo "   curl -X POST http://localhost:3000/util/sync/init"
echo ""

echo "📊 Endpoints disponibles después de la instalación:"
echo "• GET  /util/sync/status     - Estado del sistema"
echo "• POST /util/sync            - Sincronización manual"
echo "• POST /util/sync/init       - Carga inicial de datos"
echo "• GET  /util/indicadores     - Últimos valores"
echo "• GET  /util/uf/historico    - Histórico de UF"
echo "• GET  /util/utm/historico   - Histórico de UTM"
echo ""

echo "⏰ Programación automática:"
echo "• Sincronización diaria: 8:00 AM (GMT-3)"
echo "• Respaldo diario: 2:00 PM (GMT-3)"
echo "• Verificación: Cada hora"
echo "• Limpieza: Primer día del mes a las 3:00 AM"
echo ""

echo "🎉 ¡Instalación completada!"
echo "El sistema se iniciará automáticamente cuando reinicies el servidor."
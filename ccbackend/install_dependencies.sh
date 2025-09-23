# Instalar dependencias para sincronización de indicadores

# Dependencias para realizar requests HTTP
npm install axios

# Dependencia para cron jobs
npm install node-cron

# Dependencias ya instaladas que necesitamos:
# - express (ya instalado)
# - mysql2 (ya instalado como db)

echo "Dependencias instaladas correctamente"
echo ""
echo "Para usar el sistema de sincronización:"
echo "1. Ejecuta el script SQL: sql/indicadores_tables.sql"
echo "2. Reinicia el servidor backend"
echo "3. Opcional: ejecuta POST /util/sync/init para datos históricos"
echo "4. La sincronización automática se ejecutará diariamente a las 8:00 AM"
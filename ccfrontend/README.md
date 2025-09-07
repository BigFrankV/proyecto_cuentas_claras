# Cuentas Claras — MVP Frontend (React + Vite + TS)

- Autenticación JWT (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout`)
- Interceptor Axios con refresh automático
- Bootstrap 5, Material Icons, tipografía corporativa (Montserrat)
- **API Explorer** (para probar cualquier endpoint)
- **Vistas genéricas** (GenericCrud) para la mayoría de recursos del dominio

## Variables de entorno
```
VITE_API_URL=http://localhost:3000
```

## Ejecutar
```bash
npm i
npm run dev
```
Abre `http://localhost:5173` con la API corriendo en `http://localhost:3000`.

## Módulos incluidos
- Categorías de gasto, Centros de costo, Proveedores, Documentos de compra, Gastos
- Emisiones, Cargos, Pagos
- Medidores, Tarifas de consumo, Lecturas
- Multas, Conciliaciones
- Amenidades, Reservas
- Soporte: Tickets, Notificaciones, Documentos, Bitácora, Parámetros de Cobranza
- Util
- **API Explorer**

> Ajusta `comunidadId` (actualmente `1` en las rutas de ejemplo) y los payloads de ejemplo según tu backend.

# Cuentas Claras - Proyecto

Este repositorio contiene la aplicación "Cuentas Claras": un sistema para gestión de comunidades, cobros, pagos y documentación asociado a edificios/unidades. Incluye un backend en Node.js/Express (ccbackend) y un frontend en React + TypeScript (ccfrontend). Este README resume características, tecnologías, endpoints principales, estructura del proyecto y cómo ejecutar y desarrollar localmente.

## Checklist de requisitos
- [x] Documentar las características generales de la aplicación
- [x] Listar endpoints y rutas principales del backend
- [x] Listar tecnologías utilizadas en frontend y backend
- [x] Indicar estructura de carpetas y archivos relevantes

## Resumen rápido

- Backend: API REST construida con Node.js y Express; ORM Sequelize para base de datos relacional, Redis para caché/sesiones, Swagger para documentación de API y utilidades como envío de correo y subida de archivos.
- Frontend: Aplicación SPA con React + TypeScript y Vite; consumo de API vía Axios; componentes reutilizables para CRUD y páginas para administración y usuario.
- Contenedores: Docker y docker-compose preparados para despliegue local y en entornos.

## Características principales

- Gestión de comunidades, edificios, torres, unidades y personas.
- Gestión de cobranzas: cargos, pagos, emisiones y conciliaciones.
- Control de gastos: gastos, categorías, centros de costo y proveedores.
- Gestión de servicios y recursos: medidores, tarifas de consumo, amenidades y reservas.
- Manejo de documentos: documentos de compra y soporte (subida/descarga).
- Administración de usuarios y roles (autenticación y autorización).
- API documentada con Swagger (archivo `src/swagger.js` en backend).

## Tecnologías

- Backend (carpeta `ccbackend`):
  - Node.js
  - Express
  - Sequelize (ORM) + SQL (scripts en `ccbackend/base/`)
  - Redis (cliente en `src/redisClient.js`)
  - Swagger (documentación)
  - Multer / upload utilities (`src/upload.js`) para ficheros
  - Nodemailer / mailer utilities (`src/mailer.js`)
  - Testing: tests en `ccbackend/test` (p.ej. `health.test.js`)
  - Docker (Dockerfile y docker-compose)

- Frontend (carpeta `ccfrontend`):
  - React + TypeScript
  - Vite (bundler / dev server)
  - Axios (cliente HTTP, `src/http/axios.ts`)
  - Context API para autenticación (`src/auth/AuthContext.tsx`)
  - Componentes CRUD genéricos (`src/components/GenericCrud.tsx`)
  - Estilos CSS simples en `src/styles/index.css`
  - Docker (Dockerfile y docker-compose)

## Estructura principal del repositorio

- `ccbackend/` - API server
  - `src/` - código del servidor: `index.js`, `db.js`, `sequelize.js`, `swagger.js`, `upload.js`, `mailer.js`
  - `src/routes/` - rutas de la API (many resources)
  - `base/` - scripts SQL y seeds
  - `test/` - tests
  - `Dockerfile`, `docker-compose.yml`, `package.json`
- `ccfrontend/` - cliente React + TypeScript
  - `src/` - aplicación: `App.tsx`, `main.tsx`, `api/`, `auth/`, `pages/`, `components/`, `http/axios.ts`
  - `Dockerfile`, `docker-compose.yml`, `package.json`, `vite.config.ts`
- `docker-compose.yml` en la raíz para orquestar ambos servicios (si aplica)

## Endpoints principales (resumen)

El backend expone una API REST con rutas agrupadas por recurso. A continuación se listan las rutas principales encontradas en `ccbackend/src/routes` (prefijo común: `/api` o similar dependiendo de la configuración en `src/index.js`):

- /auth - Autenticación y gestión de sesión (login, refresh, logout, registro)
- /personas - CRUD y búsqueda de personas / propietarios / residentes
- /comunidades - Gestión de comunidades
- /edificios - Gestión de edificios
- /torres - Gestión de torres dentro de edificios
- /unidades - Unidades (departamentos) y su info
- /cargos - Cargos/line items para facturación
- /emisiones - Emisiones/periodos de cobro
- /pagos - Registro y consulta de pagos
- /conciliaciones - Conciliaciones bancarias / pagos
- /gastos - Registro y consulta de gastos
- /categoriasGasto - Categorías de gastos
- /centrosCosto - Centros de costo
- /proveedores - Gestión de proveedores
- /documentosCompra - Subida / descarga / listado de documentos de compra
- /medidores - Lecturas y medidores (consumo)
- /tarifasConsumo - Tarifas aplicadas a consumos
- /amenidades - Gestión de amenidades y reservas
- /membresias - Gestión de membresías (si aplica)
- /multas - Registro de multas y sanciones
- /soporte - Tickets y bitácora de soporte
- /webhooks - Endpoints para integraciones externas
- /util - Utilidades varias (p. ej. healthcheck)

Nota: la ruta raíz exacta (por ejemplo `/api/*`) depende del enrutado definido en `ccbackend/src/index.js` o `ccbackend/src/routes/util.js`.

### Ejemplo de endpoints comunes

- POST /auth/login -> Autenticar usuario
- POST /auth/register -> Registrar nuevo usuario (si habilitado)
- GET /comunidades -> Listar comunidades
- GET /comunidades/:id -> Obtener comunidad por id
- POST /unidades -> Crear unidad
- GET /pagos?unidadId=... -> Listar pagos de una unidad
- POST /documentosCompra -> Subir documento (multipart/form-data)

Para detalles de cada endpoint revisa:
- `ccbackend/endpoints.md` (si existe) y los ficheros en `ccbackend/src/routes/`.

## Base de datos y seeds

- Los scripts SQL y seeds están en `ccbackend/base/` (por ejemplo `schema.sql`, `cuentasclaras.sql`, `z_seed_appdata.sql`).
- Hay un script para crear superadmin: `create_superadmin.sql`.

## Variables de entorno

- El proyecto incluye plantillas `.env.example` en `ccbackend` y `ccfrontend`. Variables típicas:
  - BACKEND_PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME
  - REDIS_URL
  - JWT_SECRET
  - SMTP_* (configuración de correo)
  - VITE_... (en frontend para URL de API)

Configura estas variables antes de ejecutar localmente o mediante Docker compose.

## Desarrollo local (resumen)

Usando Docker (recomendado):

1. Copia los archivos `.env` desde `.env.example` y ajusta valores.
2. En la raíz (o en las carpetas `ccbackend`/`ccfrontend`) ejecuta:

```bash
docker-compose up --build
```

O bien levantar solo un servicio:

```bash
cd ccbackend
docker-compose up --build

cd ../ccfrontend
docker-compose up --build
```

Sin Docker (local):

Backend:
1. Entrar a `ccbackend`.
2. Instalar dependencias: `npm install`.
3. Crear `.env` a partir de `.env.example`.
4. Ejecutar migraciones / seeds con Sequelize o ejecutar los scripts SQL provistos.
5. Iniciar: `npm start` o `npm run dev`.

Frontend:
1. Entrar a `ccfrontend`.
2. `npm install`.
3. Crear `.env` (p. ej. `VITE_API_URL=http://localhost:3000/api`).
4. `npm run dev`.

## Testing y verificación rápida

- El backend tiene al menos un test de salud en `ccbackend/test/health.test.js`.
- Ejecuta tests con el comando configurado en `ccbackend/package.json`, por ejemplo `npm test`.

## Archivos importantes a revisar

- `ccbackend/src/index.js` — Punto de entrada del servidor y configuración de rutas.
- `ccbackend/src/routes/` — Implementación de endpoints por recurso.
- `ccbackend/base/` — SQL y seeds.
- `ccfrontend/src/pages/` — Páginas principales de la aplicación.
- `ccfrontend/src/http/axios.ts` — Cliente HTTP configurado para consumir la API.

## Siguientes pasos recomendados

- Completar y revisar `ccbackend/endpoints.md` para documentación por endpoint.
- Añadir ejemplos de request/responses o colección Postman (hay `postman/` en el repo).
- Integrar CI que ejecute tests y linting.

---

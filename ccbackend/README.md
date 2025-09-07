# Cuentas Claras - API técnica

Este repositorio contiene una API mínima en Node.js / Express para la gestión de comunidades, edificios, unidades, personas, emisiones, cargos y pagos.

Contenido del README
- Resumen técnico
- Requisitos
- Instalación y ejecución
- Variables de entorno
- Base de datos y esquemas
- Autenticación y autorización (incluye superadmin)
- Endpoints principales (resumen)
- Ejemplos de uso (curl / PowerShell)
- Postman & Swagger
- Testing y desarrollo
- Seguridad y recomendaciones operativas

Resumen técnico
- Lenguaje: Node.js (11+ compatible; probar con Node 14+)
- Framework: Express
- Base de datos: MySQL (InnoDB)
- Auth: JWT (middleware en `src/middleware/auth.js`), hashing con bcryptjs
- Autorización: RBAC por membresías + flag global `is_superadmin` (middleware en `src/middleware/authorize.js`)

Requisitos
- Node.js 14+ instalado
- MySQL 8+ y la base de datos `cuentasclaras` creada

Instalación y ejecución
1. Instalar dependencias

```powershell
npm install
```

2. Configurar variables de entorno: copia y edita ` .env.example` -> `.env` (o crea `.env` con las variables listadas abajo).

3. Ejecutar la aplicación

```powershell
npm start
```

Variables de entorno (recomendadas)
- DB_HOST=localhost
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=secret
- DB_NAME=cuentasclaras
- JWT_SECRET=change_me
- PORT=3000

Base de datos y esquema
- El esquema de tablas está en `base/schema.sql`.
- Si necesitas un superadministrador app-level, hay un helper en `base/create_superadmin.sql` que:
	- crea una comunidad demo y persona demo
	- añade la columna `is_superadmin` a `usuario` (si no existe)
	- muestra ejemplos para insertar/actualizar un `usuario` con `is_superadmin = 1`

Notas sobre superadmin
- `is_superadmin` es un flag a nivel de aplicación en la tabla `usuario`.
- Un usuario con `is_superadmin = 1` obtiene un bypass en las comprobaciones de rol (permiso global).
- Tokens emitidos incluirán `is_superadmin` en su payload; el middleware lo respeta.
- Para crear o marcar un usuario como superadmin desde SQL:

```sql
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0;
UPDATE usuario SET is_superadmin = 1 WHERE username = 'superadmin';
-- Para quitar: UPDATE usuario SET is_superadmin = 0 WHERE username = 'superadmin';
```

Autenticación y tokens
- Registro: POST /auth/register
	- Request: { username, password, email?, persona_id? }
	- Respuesta: { id, username, token }
	- Nota: la API ignora cualquier intento de establecer `is_superadmin` durante registro público.

- Login: POST /auth/login
	- Request: { username, password }
	- Respuesta: { token }
	- JWT payload de ejemplo:

```json
{
	"sub": 123,
	"username": "user",
	"persona_id": 45,
	"roles": ["admin"],
	"comunidad_id": 2,
	"is_superadmin": true
}
```

- Uso: agregar cabecera Authorization en requests protegidos:

```
Authorization: Bearer <JWT>
```

Endpoints principales (resumen organizado)
- Auth
	- POST /auth/register
	- POST /auth/login
	- POST /auth/refresh
	- GET  /auth/me

- Comunidades
	- GET  /comunidades
	- POST /comunidades
	- GET  /comunidades/:id
	- PATCH /comunidades/:id
	- DELETE /comunidades/:id

- Edificios / Torres / Unidades
	- CRUD en `/edificios`, `/torres`, `/unidades` y rutas anidadas por comunidad/edificio

- Personas / Usuarios / Membresías
	- CRUD /personas
	- POST /auth/register (usuario)
	- Rutas para `membresias` en `/comunidades/:comunidadId/membresias`

- Emisiones / Cargos / Pagos
	- Rutas para crear emision de gasto común, previsualizar prorrateo y generar cargos
	- Rutas para crear y aplicar pagos

- Util y Soporte
	- GET /healthz
	- Rutas de soporte/tickets

Para documentación completa con ejemplos de request/response y esquemas, usar la UI de Swagger si está habilitada (ruta típica: `/docs`).

Ejemplos rápidos (PowerShell / curl)
- Login (PowerShell):

```powershell
$body = @{ username = 'superadmin'; password = 'SuperP@ssw0rd!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType 'application/json' -Body $body
```

- Usar token con curl:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/comunidades
```

Postman
- Hay colecciones en `postman/`:
	- `postman/edificio-api.postman_collection.json` — colección principal con scripts para capturar token y ids de recursos.
	- `postman/users-seeds.postman_collection.json` — cargas/seed para crear personas/usuarios.
- Las requests incluyen test scripts que guardan variables en el environment: `token`, `personaId`, `comunidadId`, `unidadId`, etc.

Swagger / OpenAPI
- Muchos endpoints están documentados con JSDoc `@openapi` en los routers. Si el servidor incluye swagger-ui, acceder a la ruta `/api-docs` para ver toda la especificación interactiva.

Testing y desarrollo
- Ejecutar pruebas unitarias (si existen) con el runner del proyecto: `npm test`.
- Para desarrollo rápido usar `nodemon` (instalar global o como dependencia dev) y ejecutar `nodemon src/index.js`.


Docker + phpMyAdmin
- Si levantás los servicios con `docker compose up -d`, phpMyAdmin estará disponible en http://localhost:8080 por defecto (puedes cambiar el puerto en `.env` con `PHPMYADMIN_PORT`).
- Acceso: usa las credenciales definidas en `.env` (por ejemplo `api_admin` / `apipassword`) o `root` y `DB_ROOT_PASSWORD`.

Seguridad y recomendaciones operativas
- JWT TTL: en producción reducir tiempo de expiración y usar refresh tokens.
- Revocación de tokens: implementar blacklist o mecanismo de sessions si necesitas revocar inmediatamente privilegios.
- Protege la operación de promoción/democión a superadmin: sólo ejecutar desde consola DBA o un endpoint fuertemente protegido y auditado.
- No expongas la creación de usuarios con `is_superadmin` desde APIs públicas.
- Habilita HTTPS y almacena `JWT_SECRET` y credenciales DB fuera del repositorio (secret manager, variables de entorno en servidor).

Próximos pasos recomendados
- Añadir endpoint admin para promover/demover usuarios con registro en tabla de auditoría.
- Implementar pruebas automáticas para flujos críticos (generación de cargos, aplicación de pagos, permisos).
- Completar reglas de prorrateo por consumo (medidores + tarifas) y agregar validaciones/ejemplos en Swagger.

Contacto y mantenimiento
- Código fuente: carpeta `src/` con rutas en `src/routes/` y middleware en `src/middleware/`.
- Esquemas y helpers SQL: `base/schema.sql`, `base/create_superadmin.sql`.

---

Este README resume el uso y la operación de la API para desarrolladores e integradores; si querés, puedo generar también un `README` más corto orientado a usuarios finales o crear el endpoint admin para gestionar `is_superadmin` desde la API.

-- PRUEBAS Y EJEMPLOS PARA APIs DE PERSONAS
-- Archivo complementario con ejemplos de uso y datos de prueba

--------------------------------------------------------------------------------
-- DATOS DE PRUEBA PARA TESTING
--------------------------------------------------------------------------------

-- Insertar datos de prueba para persona
INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
VALUES
('30457892', '3', 'Juan Carlos', 'Delgado Rodríguez', 'juan.delgado@email.com', '+5491155551234', 'Av. Libertador 1234, Piso 4, CABA', NOW(), NOW()),
('28765432', '1', 'María Elena', 'López García', 'maria.lopez@email.com', '+5491155555678', 'Calle Florida 567, Piso 8, CABA', NOW(), NOW()),
('25987654', 'K', 'Carlos Alberto', 'Ramírez Silva', 'carlos.ramirez@email.com', '+5491155559012', 'Av. Corrientes 890, Piso 12, CABA', NOW(), NOW()),
('32123456', '7', 'Ana María', 'Gómez Fernández', 'ana.gomez@email.com', '+5491155553456', 'Bv. San Juan 234, Piso 3, CABA', NOW(), NOW()),
('27654321', '5', 'Pablo José', 'Vázquez Morales', 'pablo.vazquez@email.com', '+5491155557890', 'Av. Santa Fe 456, Piso 7, CABA', NOW(), NOW());

-- Insertar usuarios para las personas
INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
VALUES
(1, 'juandelgado', '$2b$10$hashedpassword1', 'juan.delgado@email.com', 1, NOW(), NOW()),
(2, 'marialopez', '$2b$10$hashedpassword2', 'maria.lopez@email.com', 1, NOW(), NOW()),
(3, 'carlosramirez', '$2b$10$hashedpassword3', 'carlos.ramirez@email.com', 1, NOW(), NOW()),
(4, 'anagomez', '$2b$10$hashedpassword4', 'ana.gomez@email.com', 0, NOW(), NOW()),
(5, 'pablovazquez', '$2b$10$hashedpassword5', 'pablo.vazquez@email.com', 1, NOW(), NOW());

--------------------------------------------------------------------------------
-- EJEMPLOS DE LLAMADAS API Y RESULTADOS ESPERADOS
--------------------------------------------------------------------------------

-- 1. GET /api/personas - Listado de personas
-- Resultado esperado: Array de objetos con la estructura del componente PersonaCard/PersonaTable

/*
[
  {
    "id": 1,
    "nombre": "Juan Carlos Delgado Rodríguez",
    "dni": "30457892-3",
    "email": "juan.delgado@email.com",
    "telefono": "+5491155551234",
    "tipo": "Propietario",
    "estado": "Activo",
    "unidades": 2,
    "fechaRegistro": "2025-01-15",
    "avatar": null
  },
  {
    "id": 2,
    "nombre": "María Elena López García",
    "dni": "28765432-1",
    "email": "maria.lopez@email.com",
    "telefono": "+5491155555678",
    "tipo": "Inquilino",
    "estado": "Activo",
    "unidades": 1,
    "fechaRegistro": "2025-02-20",
    "avatar": null
  }
]
*/

-- 2. GET /api/personas/stats - Estadísticas
-- Resultado esperado: Objeto con estadísticas para PersonaStats

/*
{
  "total": 5,
  "propietarios": 3,
  "inquilinos": 1,
  "administradores": 1
}
*/

-- 3. GET /api/personas/1 - Detalle completo de persona
-- Resultado esperado: Objeto completo para la vista de detalle

/*
{
  "id": 1,
  "dni": "30457892-3",
  "nombres": "Juan Carlos",
  "apellidos": "Delgado Rodríguez",
  "nombre_completo": "Juan Carlos Delgado Rodríguez",
  "email": "juan.delgado@email.com",
  "telefono": "+5491155551234",
  "direccion": "Av. Libertador 1234, Piso 4, CABA",
  "username": "juandelgado",
  "usuario_activo": 1,
  "fechaRegistro": "2025-01-15",
  "ultimoAcceso": "2025-01-20",
  "nivelAcceso": "Usuario Estándar",
  "tipo": "Propietario",
  "estado": "Activo",
  "total_unidades": 2,
  "saldo_total": 0,
  "avatar": null
}
*/

-- 4. GET /api/personas/1/unidades - Unidades asociadas
-- Resultado esperado: Array de unidades para la pestaña unidades

/*
[
  {
    "id": 1,
    "nombre": "Dpto 4B",
    "edificio": "Torre Norte",
    "torre": "Torre A",
    "comunidad": "Parque Real",
    "direccion": "Av. Libertador 1234, Torre Norte, Torre A, Dpto 4B",
    "metrosCuadrados": 85,
    "estado": "Activo",
    "saldoPendiente": 0,
    "relacion": "Propietario",
    "fecha_asignacion": "2023-01-15",
    "fecha_fin": null,
    "porcentaje": 100.00
  }
]
*/

-- 5. GET /api/personas/1/pagos - Pagos realizados
-- Resultado esperado: Array de pagos para la pestaña pagos

/*
[
  {
    "id": 1,
    "fecha": "2025-01-15",
    "unidad": "Dpto 4B",
    "periodo": "Enero 2025",
    "importe": 45000,
    "metodo": "Transferencia",
    "estado": "Pagado",
    "referencia": "TRF-2025-001",
    "comprobante_num": "001-2025",
    "comunidad": "Parque Real"
  }
]
*/

-- 6. GET /api/personas/1/actividad - Actividad/auditoría
-- Resultado esperado: Array de actividades para la pestaña actividad

/*
[
  {
    "fecha": "2025-01-20",
    "hora": "15:30:00",
    "fecha_completa": "2025-01-20 15:30:00",
    "titulo": "Inicio de sesión",
    "descripcion": "El usuario inició sesión en el sistema",
    "ip_address": "192.168.1.100",
    "valores_anteriores": null,
    "valores_nuevos": null
  }
]
*/

-- 7. GET /api/personas/1/documentos - Documentos asociados
-- Resultado esperado: Array de documentos para la pestaña documentos

/*
[
  {
    "id": 1,
    "nombre": "Contrato Compraventa.pdf",
    "tipo": "Contrato",
    "fecha": "2023-01-15",
    "tamaño": "2.4 MB",
    "icono": "picture_as_pdf",
    "description": "Contrato de compraventa del departamento",
    "url": "/uploads/contrato_12345.pdf",
    "subido_por": "Juan Delgado"
  }
]
*/

--------------------------------------------------------------------------------
-- PRUEBAS DE FILTROS Y BÚSQUEDA
--------------------------------------------------------------------------------

-- 8. GET /api/personas?search=Juan&tipo=todos&estado=activos
-- Búsqueda por nombre con filtros

-- 9. GET /api/personas?tipo=propietarios&estado=activos
-- Filtrar solo propietarios activos

-- 10. GET /api/personas?search=@email.com
-- Búsqueda por email

--------------------------------------------------------------------------------
-- PRUEBAS DE CREACIÓN Y EDICIÓN
--------------------------------------------------------------------------------

-- POST /api/personas - Crear nueva persona
/*
Body:
{
  "tipo": "Propietario",
  "nombres": "Pedro",
  "apellidos": "Martínez López",
  "tipoDoc": "DNI",
  "nroDoc": "30457892",
  "dv": "3",
  "email": "pedro.martinez@email.com",
  "telefono": "+5491155559999",
  "direccion": "Av. Rivadavia 1000, Piso 5, CABA",
  "crearCuenta": true,
  "username": "pedromartinez",
  "password": "password123",
  "nivelAcceso": "Usuario Estándar",
  "unidades": [
    {
      "id": 1,
      "relacion": "Propietario"
    }
  ]
}
*/

-- PUT /api/personas/1 - Actualizar persona existente
/*
Body: (mismos campos que creación, más el ID)
{
  "id": 1,
  "nombres": "Juan Carlos",
  "apellidos": "Delgado Rodríguez",
  "email": "juan.delgado.nuevo@email.com",
  ...
}
*/

--------------------------------------------------------------------------------
-- PRUEBAS DE VALIDACIÓN
--------------------------------------------------------------------------------

-- GET /api/personas/validate?field=rut&value=30457892&exclude=1
-- Validar que RUT no existe (excluyendo el ID 1 para edición)

-- GET /api/personas/validate?field=username&value=juandelgado&exclude=1
-- Validar que username no existe

-- GET /api/personas/validate?field=email&value=juan@email.com&exclude=1
-- Validar que email no existe

--------------------------------------------------------------------------------
-- SCRIPTS PARA POBLAR DATOS DE PRUEBA
--------------------------------------------------------------------------------

-- Crear comunidades de prueba
INSERT INTO comunidad (rut, dv, razon_social, nombre_fantasia, email, telefono, direccion, created_at, updated_at)
VALUES
('761234560', '1', 'Comunidad Parque Real', 'Parque Real', 'admin@parquereal.cl', '+56225551234', 'Av. Libertador 1234, Santiago', NOW(), NOW()),
('762345671', '2', 'Comunidad Valle Verde', 'Valle Verde', 'admin@valleverde.cl', '+56225555678', 'Calle Los Alamos 567, Santiago', NOW(), NOW());

-- Crear edificios
INSERT INTO edificio (comunidad_id, nombre, direccion, created_at, updated_at)
VALUES
(1, 'Torre Norte', 'Av. Libertador 1234', NOW(), NOW()),
(1, 'Torre Sur', 'Av. Libertador 1234', NOW(), NOW()),
(2, 'Barrio Residencial', 'Calle Los Alamos 567', NOW(), NOW());

-- Crear torres
INSERT INTO torre (edificio_id, nombre, created_at, updated_at)
VALUES
(1, 'Torre A', NOW(), NOW()),
(1, 'Torre B', NOW(), NOW()),
(2, 'Torre C', NOW(), NOW());

-- Crear unidades
INSERT INTO unidad (comunidad_id, edificio_id, torre_id, codigo, m2_utiles, activa, created_at, updated_at)
VALUES
(1, 1, 1, 'Dpto 4B', 85, 1, NOW(), NOW()),
(1, 1, 1, 'Dpto 7A', 95, 1, NOW(), NOW()),
(2, 3, NULL, 'Casa 12', 120, 1, NOW(), NOW());

-- Asignar unidades a personas
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
VALUES
(1, 1, 1, 'propietario', '2023-01-15', 100.00, NOW(), NOW()),
(1, 2, 1, 'propietario', '2023-06-01', 100.00, NOW(), NOW()),
(1, 1, 2, 'arrendatario', '2024-01-01', 100.00, NOW(), NOW()),
(2, 3, 4, 'propietario', '2022-03-10', 100.00, NOW(), NOW());

-- Crear roles
INSERT INTO rol (codigo, nombre, descripcion, nivel_acceso, es_rol_sistema, created_at)
VALUES
('superadmin', 'Super Administrador', 'Acceso total al sistema', 100, 1, NOW()),
('admin', 'Administrador', 'Administrador de comunidad', 80, 0, NOW()),
('usuario_estandar', 'Usuario Estándar', 'Usuario estándar del sistema', 10, 0, NOW());

-- Asignar roles
INSERT INTO usuario_comunidad_rol (usuario_id, comunidad_id, rol_id, desde, activo, created_at, updated_at)
VALUES
(3, 1, 2, '2023-01-01', 1, NOW(), NOW()), -- Carlos Ramírez es admin de Parque Real
(3, 2, 2, '2023-01-01', 1, NOW(), NOW()); -- Carlos Ramírez es admin de Valle Verde

--------------------------------------------------------------------------------
-- TESTING ENDPOINTS CON CURL
--------------------------------------------------------------------------------

-- Listar todas las personas
curl -X GET "http://localhost:3001/api/personas" \
  -H "Content-Type: application/json"

-- Obtener estadísticas
curl -X GET "http://localhost:3001/api/personas/stats" \
  -H "Content-Type: application/json"

-- Obtener detalle de persona ID 1
curl -X GET "http://localhost:3001/api/personas/1" \
  -H "Content-Type: application/json"

-- Obtener unidades de persona ID 1
curl -X GET "http://localhost:3001/api/personas/1/unidades" \
  -H "Content-Type: application/json"

-- Buscar personas con filtros
curl -X GET "http://localhost:3001/api/personas?search=juan&tipo=propietarios&estado=activos" \
  -H "Content-Type: application/json"

-- Crear nueva persona
curl -X POST "http://localhost:3001/api/personas" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Test",
    "apellidos": "User",
    "rut": "12345678",
    "dv": "9",
    "email": "test@example.com",
    "telefono": "+5491111111111",
    "crearCuenta": true,
    "username": "testuser",
    "password": "testpass123"
  }'

-- Actualizar persona ID 1
curl -X PUT "http://localhost:3001/api/personas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan Carlos",
    "apellidos": "Delgado Actualizado",
    "email": "juan.actualizado@email.com"
  }'

-- Eliminar persona ID 1 (lógico)
curl -X DELETE "http://localhost:3001/api/personas/1" \
  -H "Content-Type: application/json"
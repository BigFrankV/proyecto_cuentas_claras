# 📐 Diagrama del Modelo de Datos Mejorado

## Modelo Anterior (Confuso)

```
┌──────────────┐
│   persona    │
│              │
│ - id         │
│ - rut, dv    │
│ - nombres    │
│ - apellidos  │
│ - email      │
└──────┬───────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────────┐          ┌──────────────────┐
│ membresia_       │          │    usuario       │
│ comunidad        │          │                  │
│                  │          │ - id             │
│ - persona_id     │          │ - persona_id ⚠️  │
│ - comunidad_id   │          │ - username       │
│ - rol (ENUM) ⚠️  │          │ - password       │
│ - desde/hasta    │          │ - is_superadmin ⚠│
└──────────────────┘          └──────────────────┘

⚠️ Problemas:
- Roles hardcodeados en ENUM
- persona_id es NULL en usuario
- is_superadmin separado del sistema de roles
- Una persona puede tener múltiples roles pero difícil de gestionar
```

---

## Modelo Nuevo (Mejorado)

```
┌──────────────┐
│   persona    │────────────────────────────────────────┐
│              │ Datos personales básicos              │
│ - id         │ (RUT, nombre, email, teléfono)        │
│ - rut, dv    │                                        │
│ - nombres    │                                        │
│ - apellidos  │                                        │
│ - email      │                                        │
└──────┬───────┘                                        │
       │                                                │
       │ FK NOT NULL (obligatorio)                     │
       │                                                │
       ▼                                                │
┌──────────────────┐                                    │
│    usuario       │ Credenciales de acceso             │
│                  │                                    │
│ - id             │                                    │
│ - persona_id ✅  │ (NOT NULL)                         │
│ - username       │                                    │
│ - password       │                                    │
│ - activo         │                                    │
└──────┬───────────┘                                    │
       │                                                │
       │ 1:N                                            │
       │                                                │
       ▼                                                │
┌─────────────────────────┐                             │
│ usuario_comunidad_rol   │ Asignación de roles        │
│                         │                             │
│ - id                    │                             │
│ - usuario_id            │                             │
│ - comunidad_id          │                             │
│ - rol_id                │◄────────┐                  │
│ - desde/hasta           │         │                  │
│ - activo                │         │                  │
└─────────┬───────────────┘         │                  │
          │                         │                  │
          │ N:1                     │ N:1              │
          │                         │                  │
          ▼                         │                  │
   ┌─────────────┐          ┌──────┴────────┐         │
   │  comunidad  │          │     rol       │         │
   │             │          │               │         │
   │ - id        │          │ - id          │         │
   │ - nombre    │          │ - codigo      │         │
   │ - direccion │          │ - nombre      │         │
   └─────────────┘          │ - nivel_acc.. │         │
                            │ - es_rol_...  │         │
                            └───────────────┘         │
                                                       │
┌──────────────────────────────────────────────────────┘
│
│ También se relaciona con:
│
├─► titulares_unidad (propietarios/arrendatarios)
│   - persona_id, unidad_id, tipo (propietario/arrendatario)
│
├─► multa (persona_id - quién recibe la multa)
│
└─► proveedor (contactos, pero tabla separada)
```

---

## Tablas Renombradas - Vista Comparativa

```
ANTES                      →  DESPUÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────┐   ┌──────────────────────────┐
│  cargo_unidad       │ → │ cuenta_cobro_unidad      │
│                     │   │                          │
│ Concepto confuso    │   │ Concepto claro chileno   │
│ "cargo" ambiguo     │   │ "cuenta de cobro"        │
└─────────────────────┘   └──────────────────────────┘

┌─────────────────────┐   ┌──────────────────────────┐
│ cargo_unidad_detalle│ → │ detalle_cuenta_unidad    │
│                     │   │                          │
│ Items del cargo     │   │ Items de la cuenta       │
└─────────────────────┘   └──────────────────────────┘

┌─────────────────────┐   ┌──────────────────────────┐
│ emision_gasto_comun │ → │ emision_gastos_comunes   │
│                     │   │                          │
│ Singular            │   │ Plural (más natural)     │
└─────────────────────┘   └──────────────────────────┘

┌─────────────────────┐   ┌──────────────────────────┐
│ tenencia_unidad     │ → │ titulares_unidad         │
│                     │   │                          │
│ Término muy legal   │   │ "Titulares" más común    │
└─────────────────────┘   └──────────────────────────┘

┌─────────────────────┐   ┌──────────────────────────┐
│ ticket              │ → │ solicitud_soporte        │
│                     │   │                          │
│ Anglicismo          │   │ Español claro            │
└─────────────────────┘   └──────────────────────────┘

┌─────────────────────┐   ┌──────────────────────────┐
│ bitacora_conserjeria│ → │ registro_conserjeria     │
│                     │   │                          │
│ "Bitácora" OK       │   │ "Registro" más común     │
└─────────────────────┘   └──────────────────────────┘
```

---

## Sistema de Roles - Jerarquía

```
                  ┌────────────────────┐
                  │   SUPERADMIN       │  Nivel 100
                  │ Acceso total       │
                  └──────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌────────▼────────┐
    │   ADMIN           │         │   CONTADOR      │
    │   Nivel 80        │         │   Nivel 60      │
    │ Admin comunidad   │         │ Reportes fin.   │
    └─────────┬─────────┘         └─────────────────┘
              │
    ┌─────────▼─────────┐
    │   COMITÉ          │  Nivel 70
    │ Gestión comunidad │
    └─────────┬─────────┘
              │
    ┌─────────┴─────────┬─────────────────┐
    │                   │                 │
┌───▼────┐      ┌───────▼──────┐  ┌──────▼─────────┐
│CONSERJE│      │ PROPIETARIO  │  │   RESIDENTE    │
│Nivel 40│      │  Nivel 30    │  │   Nivel 20     │
│        │      │              │  │                │
└────────┘      └──────────────┘  └────────────────┘

✅ Ventajas:
- Jerárquico por nivel numérico
- Fácil agregar nuevos roles
- Un usuario puede tener múltiples roles
- Auditoría con fechas desde/hasta/activo
```

---

## Flujo de Autenticación

```
1. LOGIN
   ┌──────────┐
   │ Usuario  │ → username + password
   └────┬─────┘
        │
        ▼
   ┌──────────────────────────────┐
   │ Validar credenciales         │
   │ SELECT * FROM usuario        │
   │ WHERE username = ?           │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │ Obtener comunidades y roles  │
   │ JOIN usuario_comunidad_rol   │
   │ JOIN comunidad               │
   │ JOIN rol                     │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │ Generar JWT con:             │
   │ - user_id                    │
   │ - persona_id                 │
   │ - comunidades[]              │
   │   - comunidad_id             │
   │   - roles[] (codigo)         │
   │   - nivel_acceso_max         │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │ Retornar token + user info   │
   └──────────────────────────────┘

2. AUTORIZACIÓN
   ┌──────────┐
   │ Request  │ → JWT en header
   └────┬─────┘
        │
        ▼
   ┌──────────────────────────────┐
   │ Verificar token JWT          │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │ Extraer user_id + comunidad  │
   └────────────┬─────────────────┘
                │
                ▼
   ┌──────────────────────────────┐
   │ Verificar roles en comunidad │
   │ SELECT rol FROM              │
   │ usuario_comunidad_rol        │
   │ WHERE usuario_id = ?         │
   │   AND comunidad_id = ?       │
   │   AND activo = 1             │
   └────────────┬─────────────────┘
                │
                ├──► ✅ Tiene permiso → Continuar
                │
                └──► ❌ No tiene permiso → 403 Forbidden
```

---

## Relaciones Clave

```
UNIDAD (Propiedad física)
   │
   ├─► cuenta_cobro_unidad (Deudas)
   │      └─► detalle_cuenta_unidad (Items)
   │
   ├─► titulares_unidad (Propietarios/Arrendatarios)
   │      └─► persona
   │
   ├─► solicitud_soporte (Tickets)
   │
   └─► medidor (Consumos)
          └─► lectura_medidor

PERSONA
   │
   ├─► usuario (1:1) - Solo si tiene acceso al sistema
   │      └─► usuario_comunidad_rol
   │             ├─► comunidad
   │             └─► rol
   │
   ├─► titulares_unidad (Propietario/Arrendatario)
   │
   └─► multa (Infracciones)

COMUNIDAD
   │
   ├─► edificio
   │      └─► torre
   │             └─► unidad
   │
   ├─► usuario_comunidad_rol (Usuarios con acceso)
   │
   ├─► emision_gastos_comunes (Emisiones mensuales)
   │      ├─► detalle_emision (Gastos del mes)
   │      └─► cuenta_cobro_unidad (Por unidad)
   │
   ├─► categoria_gasto (Categorías de gastos)
   │
   ├─► proveedor (Empresas/personas que prestan servicios)
   │
   └─► amenidad (Instalaciones)
          └─► reserva_amenidad
```

---

## Comparación: Gestión de Roles

### ANTES ❌
```sql
-- Un rol por persona en comunidad
INSERT INTO membresia_comunidad 
  (persona_id, comunidad_id, rol)
VALUES (1, 1, 'propietario');

-- Para agregar segundo rol: Nueva fila
INSERT INTO membresia_comunidad 
  (persona_id, comunidad_id, rol)
VALUES (1, 1, 'comite');

-- ⚠️ Problema: persona_id != usuario_id
-- ⚠️ Roles hardcodeados en ENUM
-- ⚠️ Superadmin separado (is_superadmin flag)
```

### DESPUÉS ✅
```sql
-- Múltiples roles por usuario
INSERT INTO usuario_comunidad_rol 
  (usuario_id, comunidad_id, rol_id, desde)
VALUES 
  (1, 1, (SELECT id FROM rol WHERE codigo='propietario'), '2024-01-01'),
  (1, 1, (SELECT id FROM rol WHERE codigo='comite'), '2025-01-01');

-- ✅ Usuario directamente (no persona)
-- ✅ Roles en tabla separada (flexible)
-- ✅ Superadmin es un rol más
-- ✅ Auditoría completa (desde/hasta/activo)
-- ✅ Nivel de acceso numérico
```

---

## Performance y Escalabilidad

```
ÍNDICES CLAVE AGREGADOS:
━━━━━━━━━━━━━━━━━━━━━━━━

usuario_comunidad_rol:
├─ PRIMARY KEY (id)
├─ INDEX (usuario_id, comunidad_id)  ← Búsquedas frecuentes
├─ INDEX (comunidad_id, rol_id)      ← Filtros por rol
├─ INDEX (activo)                    ← Filtros por estado
└─ UNIQUE (usuario_id, comunidad_id, rol_id, activo)

cuenta_cobro_unidad:
├─ INDEX (comuni+dad_id, estado)      ← Dashboard
├─ INDEX (unidad_id)                 ← Consultas por unidad
└─ INDEX (estado)                    ← Reportes

rol:
├─ UNIQUE (codigo)                   ← Búsquedas por código
└─ INDEX (nivel_acceso)              ← Comparaciones jerárquicas

VISTAS DE COMPATIBILIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━
Permiten transición gradual del código:
- cargo_unidad → cuenta_cobro_unidad
- membresia_comunidad → usuario_comunidad_rol
- etc.

Una vez migrado el código, eliminar vistas.
```

---

**Última actualización:** Octubre 2025  
**Versión del modelo:** 2.0

-- queries_unidades.sql
-- Consultas SQL completas para el módulo "unidades".
-- Parámetros indicados como :param (ej. :unidad_id, :comunidad_id, :search, :limit, :offset)
-- Adaptar la sintaxis de parámetros según el cliente (node/mysql2, psql, etc.).

--------------------------------------------------------------------------------
-- 1) LISTADO principal de unidades (con filtros, búsqueda, saldo y último pago)
--------------------------------------------------------------------------------
-- Parámetros: :comunidad_id, :edificio_id, :torre_id, :search, :activa, :limit, :offset

SELECT
  u.id,
  u.codigo AS numero,
  u.m2_utiles,
  u.m2_terrazas,
  u.alicuota,
  u.nro_estacionamiento,
  u.nro_bodega,
  u.activa,
  c.razon_social AS comunidad_nombre,
  e.nombre AS edificio_nombre,
  t.nombre AS torre_nombre,
  COALESCE( (SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu WHERE ccu.unidad_id = u.id), 0 ) AS saldo_total,
  (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado = 'aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha,
  (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
     FROM titulares_unidad tu
     JOIN persona pe ON pe.id = tu.persona_id
     WHERE tu.unidad_id = u.id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
     ORDER BY tu.desde DESC LIMIT 1) AS propietario_nombre,
  (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
     FROM titulares_unidad tu
     JOIN persona pe ON pe.id = tu.persona_id
     WHERE tu.unidad_id = u.id AND tu.tipo = 'arrendatario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
     ORDER BY tu.desde DESC LIMIT 1) AS residente_nombre
FROM unidad u
LEFT JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
WHERE 1 = 1
  AND (:comunidad_id IS NULL OR u.comunidad_id = :comunidad_id)
  AND (:edificio_id IS NULL OR u.edificio_id = :edificio_id)
  AND (:torre_id IS NULL OR u.torre_id = :torre_id)
  AND (:activa IS NULL OR u.activa = :activa)
  AND (
    :search IS NULL
    OR u.codigo LIKE CONCAT('%', :search, '%')
    OR EXISTS (
      SELECT 1 FROM persona pe
      JOIN titulares_unidad tu ON tu.persona_id = pe.id
      WHERE tu.unidad_id = u.id
        AND (pe.nombres LIKE CONCAT('%', :search, '%') OR pe.apellidos LIKE CONCAT('%', :search, '%') OR pe.rut LIKE CONCAT('%', :search, '%'))
    )
  )
ORDER BY u.codigo
LIMIT :limit OFFSET :offset;

--------------------------------------------------------------------------------
-- 2) Estadísticas rápidas (total, activas, inactivas, saldo total)
--------------------------------------------------------------------------------
-- Parámetros opcionales: :comunidad_id, :edificio_id, :torre_id, :search

SELECT
  COUNT(*) AS total_unidades,
  SUM(u.activa = 1) AS total_activas,
  SUM(u.activa = 0) AS total_inactivas,
  COALESCE( (SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu
              JOIN unidad uu ON uu.id = ccu.unidad_id
              WHERE (:comunidad_id IS NULL OR uu.comunidad_id = :comunidad_id)
                AND (:edificio_id IS NULL OR uu.edificio_id = :edificio_id)
                AND (:torre_id IS NULL OR uu.torre_id = :torre_id)
            ), 0 ) AS saldo_total
FROM unidad u
WHERE (:comunidad_id IS NULL OR u.comunidad_id = :comunidad_id)
  AND (:edificio_id IS NULL OR u.edificio_id = :edificio_id)
  AND (:torre_id IS NULL OR u.torre_id = :torre_id)
  AND (:search IS NULL OR u.codigo LIKE CONCAT('%', :search, '%'));

--------------------------------------------------------------------------------
-- 3) DETALLE: información general de una unidad (resumen)
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  u.id,
  u.codigo AS numero,
  u.alicuota,
  u.m2_utiles,
  u.m2_terrazas,
  u.nro_bodega,
  u.nro_estacionamiento,
  u.activa,
  c.id AS comunidad_id, c.razon_social AS comunidad_nombre,
  e.id AS edificio_id, e.nombre AS edificio_nombre,
  t.id AS torre_id, t.nombre AS torre_nombre,
  COALESCE( (SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu WHERE ccu.unidad_id = u.id), 0 ) AS saldo_total,
  (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
     FROM titulares_unidad tu
     JOIN persona pe ON pe.id = tu.persona_id
     WHERE tu.unidad_id = u.id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
     ORDER BY tu.desde DESC LIMIT 1) AS propietario_nombre,
  (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado = 'aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha
FROM unidad u
LEFT JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
WHERE u.id = :unidad_id;

--------------------------------------------------------------------------------
-- 4) TITULARES / PROPIETARIOS y RESIDENTES de una unidad (historial)
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  tu.id,
  tu.tipo,
  tu.desde,
  tu.hasta,
  tu.porcentaje,
  p.id AS persona_id,
  p.rut, p.dv,
  p.nombres, p.apellidos, p.email, p.telefono
FROM titulares_unidad tu
JOIN persona p ON p.id = tu.persona_id
WHERE tu.unidad_id = :unidad_id
ORDER BY tu.desde DESC, tu.hasta DESC;

--------------------------------------------------------------------------------
-- 5) CUENTAS DE COBRO (emisiones) de una unidad
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  ccu.id,
  ccu.emision_id,
  ccu.comunidad_id,
  ccu.monto_total,
  ccu.saldo,
  ccu.estado,
  ccu.interes_acumulado,
  ccu.created_at,
  ccu.updated_at,
  eg.periodo AS emision_periodo,
  eg.fecha_vencimiento AS emision_vencimiento
FROM cuenta_cobro_unidad ccu
LEFT JOIN emision_gastos_comunes eg ON eg.id = ccu.emision_id
WHERE ccu.unidad_id = :unidad_id
ORDER BY ccu.created_at DESC;

--------------------------------------------------------------------------------
-- 6) DETALLE de una cuenta_cobro_unidad (partidas que la componen)
--------------------------------------------------------------------------------
-- Parámetro: :cuenta_cobro_unidad_id

SELECT
  dcu.id,
  dcu.categoria_id,
  cat.nombre AS categoria_nombre,
  dcu.glosa,
  dcu.monto,
  dcu.origen,
  dcu.origen_id,
  dcu.iva_incluido,
  dcu.created_at
FROM detalle_cuenta_unidad dcu
LEFT JOIN categoria_gasto cat ON cat.id = dcu.categoria_id
WHERE dcu.cuenta_cobro_unidad_id = :cuenta_cobro_unidad_id
ORDER BY dcu.id;

--------------------------------------------------------------------------------
-- 7) DETALLE COMPLETO: cuentas + detalle (una consulta que trae todo)
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  ccu.id AS cuenta_id,
  ccu.emision_id, ccu.monto_total, ccu.saldo, ccu.estado, ccu.interes_acumulado, ccu.created_at AS cuenta_created,
  dcu.id AS detalle_id, dcu.categoria_id, cat.nombre AS categoria_nombre, dcu.glosa, dcu.monto AS detalle_monto, dcu.origen, dcu.origen_id
FROM cuenta_cobro_unidad ccu
LEFT JOIN detalle_cuenta_unidad dcu ON dcu.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN categoria_gasto cat ON cat.id = dcu.categoria_id
WHERE ccu.unidad_id = :unidad_id
ORDER BY ccu.created_at DESC, dcu.id;

--------------------------------------------------------------------------------
-- 8) PAGOS de la unidad (lista) + aplicaciones
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  p.id,
  p.fecha,
  p.monto,
  p.medio,
  p.referencia,
  p.estado,
  p.comprobante_num,
  pa.cuenta_cobro_unidad_id,
  pa.monto AS aplicado_monto,
  pa.prioridad
FROM pago p
LEFT JOIN pago_aplicacion pa ON pa.pago_id = p.id
WHERE p.unidad_id = :unidad_id
ORDER BY p.fecha DESC, p.id DESC;

--------------------------------------------------------------------------------
-- 9) APLICACIONES por cuenta_cobro_unidad
--------------------------------------------------------------------------------
-- Parámetro: :cuenta_cobro_unidad_id

SELECT
  pa.id,
  pa.pago_id,
  pa.monto,
  pa.prioridad,
  p.fecha AS pago_fecha,
  p.monto AS pago_monto,
  p.medio,
  p.comprobante_num
FROM pago_aplicacion pa
LEFT JOIN pago p ON p.id = pa.pago_id
WHERE pa.cuenta_cobro_unidad_id = :cuenta_cobro_unidad_id
ORDER BY pa.id;

--------------------------------------------------------------------------------
-- 10) VISTA financiera por unidad (vista cargo_financiero_unidad)
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT * FROM cargo_financiero_unidad v
WHERE v.unidad_id = :unidad_id
ORDER BY v.created_at DESC;

--------------------------------------------------------------------------------
-- 11) MEDIDORES de la unidad y ÚLTIMA lectura por medidor
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  m.id AS medidor_id,
  m.tipo,
  m.codigo,
  m.es_compartido,
  lm.ultima_lectura,
  lm.fecha_lectura,
  lm.periodo
FROM medidor m
LEFT JOIN (
  SELECT l.medidor_id,
         l.lectura AS ultima_lectura,
         l.fecha AS fecha_lectura,
         l.periodo
  FROM lectura_medidor l
  JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
  ) lm2 ON lm2.medidor_id = l.medidor_id AND lm2.max_fecha = l.fecha
) lm ON lm.medidor_id = m.id
WHERE m.unidad_id = :unidad_id
ORDER BY m.tipo, m.codigo;

--------------------------------------------------------------------------------
-- 12) HISTORIAL de lecturas (por medidor)
--------------------------------------------------------------------------------
-- Parámetro: :medidor_id, :periodo_desde, :periodo_hasta

SELECT
  l.id,
  l.periodo,
  l.fecha,
  l.lectura
FROM lectura_medidor l
WHERE l.medidor_id = :medidor_id
  AND (:periodo_desde IS NULL OR l.periodo >= :periodo_desde)
  AND (:periodo_hasta IS NULL OR l.periodo <= :periodo_hasta)
ORDER BY l.periodo DESC;

--------------------------------------------------------------------------------
-- 13) TICKETS / INCIDENTES abiertos de la unidad
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

SELECT
  ts.id, ts.categoria, ts.titulo, ts.estado, ts.prioridad, ts.asignado_a, ts.created_at
FROM ticket_soporte ts
WHERE ts.unidad_id = :unidad_id
ORDER BY ts.created_at DESC;

--------------------------------------------------------------------------------
-- 14) MULTAS y RESERVAS de la unidad
--------------------------------------------------------------------------------
-- Parámetro: :unidad_id

-- multas
SELECT id, motivo, descripcion, monto, persona_id, created_at, updated_at
FROM multa
WHERE unidad_id = :unidad_id
ORDER BY created_at DESC;

-- reservas de amenidades
SELECT id, amenidad_id, inicio, fin, estado, created_at
FROM reserva_amenidad
WHERE unidad_id = :unidad_id
ORDER BY inicio DESC;

--------------------------------------------------------------------------------
-- 15) DROPDOWNS / selects de soporte
--------------------------------------------------------------------------------
-- Comunidades
SELECT id, razon_social AS nombre FROM comunidad ORDER BY nombre;

-- Edificios por comunidad
SELECT id, nombre, direccion FROM edificio WHERE comunidad_id = :comunidad_id ORDER BY nombre;

-- Torres por edificio
SELECT id, nombre, codigo FROM torre WHERE edificio_id = :edificio_id ORDER BY nombre;

-- Unidades por torre
SELECT u.id, u.codigo AS numero, u.nro_estacionamiento, u.nro_bodega
FROM unidad u
WHERE u.torre_id = :torre_id
ORDER BY u.codigo;

-- Distinct estacionamientos / bodegas
SELECT DISTINCT nro_estacionamiento FROM unidad WHERE nro_estacionamiento IS NOT NULL;
SELECT DISTINCT nro_bodega FROM unidad WHERE nro_bodega IS NOT NULL;

--------------------------------------------------------------------------------
-- 16) BÚSQUEDA AVANZADA: por propietario/residente
--------------------------------------------------------------------------------
-- Parámetro: :search

SELECT DISTINCT u.id, u.codigo, CONCAT(pe.nombres,' ',pe.apellidos) AS persona
FROM unidad u
JOIN titulares_unidad tu ON tu.unidad_id = u.id
JOIN persona pe ON pe.id = tu.persona_id
WHERE (pe.nombres LIKE CONCAT('%', :search, '%') OR pe.apellidos LIKE CONCAT('%', :search, '%') OR pe.rut LIKE CONCAT('%', :search, '%'))
ORDER BY u.codigo
LIMIT 50;

--------------------------------------------------------------------------------
-- 17) Informe / resúmenes: saldo por unidad dentro de una comunidad
--------------------------------------------------------------------------------
-- Parámetro: :comunidad_id

SELECT
  u.id,
  u.codigo,
  COALESCE(SUM(ccu.saldo),0) AS saldo_total,
  (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado='aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha
FROM unidad u
LEFT JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id
WHERE u.comunidad_id = :comunidad_id
GROUP BY u.id, u.codigo
ORDER BY saldo_total DESC
LIMIT 200;

--------------------------------------------------------------------------------
-- 18) Validaciones / unicidad bodega/estacionamiento
--------------------------------------------------------------------------------
-- Parámetros: :comunidad_id, :nro_bodega, :nro_estacionamiento

SELECT id, codigo FROM unidad WHERE comunidad_id = :comunidad_id AND nro_bodega = :nro_bodega LIMIT 1;
SELECT id, codigo FROM unidad WHERE comunidad_id = :comunidad_id AND nro_estacionamiento = :nro_estacionamiento LIMIT 1;

--------------------------------------------------------------------------------
-- NOTAS RÁPIDAS:
-- - Ajustar parámetros según el cliente DB (ej. ? en mysql2, $1 en pg, :name en algunos ORMs).
-- - Para grandes volúmenes, convertir subconsultas por propietario/residente a LEFT JOIN + GROUP_CONCAT/MAX para evitar N+1.
-- - Índices recomendados: unidad(comunidad_id), unidad(edificio_id), unidad(torre_id), unidad(codigo), cuenta_cobro_unidad(unidad_id), detalle_cuenta_unidad(cuenta_cobro_unidad_id), pago(unidad_id), pago_aplicacion(pago_id), titulares_unidad(unidad_id), medidor(unidad_id), lectura_medidor(medidor_id, fecha).
-- - Si quieres, genero versiones optimizadas (JOIN + GROUP BY) de las consultas principales.

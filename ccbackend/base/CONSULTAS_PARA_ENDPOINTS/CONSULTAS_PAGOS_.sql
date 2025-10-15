-- ========================================================================================
-- CONSULTAS SQL PARA EL MÓDULO PAGOS
-- Sistema de Cuentas Claras
-- ========================================================================================

-- =============================================================================
-- 1. LISTADO DE PAGOS - Información básica para la vista principal
-- =============================================================================

-- Consulta principal para el listado de pagos
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    p.fecha_creacion,
    p.fecha_actualizacion,
    -- Información de la persona/unidad
    COALESCE(u.numero_unidad, 'N/A') as unidad_numero,
    COALESCE(CONCAT(pe.nombre, ' ', pe.apellido_paterno), 'N/A') as residente_nombre,
    pe.email as residente_email,
    -- Información de la comunidad
    c.nombre as comunidad_nombre,
    -- Información adicional
    p.referencia_externa,
    p.comentarios,
    p.monto_original,
    p.moneda,
    -- Estadísticas calculadas
    CASE
        WHEN p.estado = 'aprobado' THEN DATEDIFF(CURRENT_DATE, p.fecha_pago)
        ELSE DATEDIFF(CURRENT_DATE, p.fecha_creacion)
    END as dias_transcurridos
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
ORDER BY p.fecha_creacion DESC;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UN PAGO
-- =============================================================================

-- Consulta para obtener detalle completo de un pago específico
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    p.referencia_externa,
    p.comentarios,
    p.monto_original,
    p.moneda,
    p.fecha_creacion,
    p.fecha_actualizacion,
    p.fecha_vencimiento,
    -- Información de la unidad
    u.id as unidad_id,
    u.numero_unidad,
    u.piso,
    u.tipo_unidad,
    t.nombre as torre_nombre,
    e.nombre as edificio_nombre,
    -- Información del residente/propietario
    pe.id as persona_id,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno, ' ', COALESCE(pe.apellido_materno, '')) as residente_nombre,
    pe.email as residente_email,
    pe.telefono as residente_telefono,
    pe.rut as residente_rut,
    -- Información de la comunidad
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    c.direccion as comunidad_direccion,
    -- Información adicional del pago
    p.url_comprobante,
    p.url_detalle,
    p.datos_gateway,
    p.intentos_fallidos,
    p.fecha_ultimo_intento,
    -- Estadísticas
    COALESCE(deuda.total_deuda_pendiente, 0) as deuda_restante_unidad,
    COALESCE(pagos_mes.cantidad_pagos_mes, 0) as pagos_mes_actual
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    -- Deuda pendiente de la unidad
    SELECT
        unidad_id,
        SUM(monto_pendiente) as total_deuda_pendiente
    FROM cuenta_cobro_unidad
    WHERE estado = 'pendiente'
    GROUP BY unidad_id
) deuda ON u.id = deuda.unidad_id
LEFT JOIN (
    -- Cantidad de pagos del mes actual
    SELECT
        persona_id,
        COUNT(*) as cantidad_pagos_mes
    FROM pago
    WHERE YEAR(fecha_pago) = YEAR(CURRENT_DATE)
      AND MONTH(fecha_pago) = MONTH(CURRENT_DATE)
      AND estado = 'aprobado'
    GROUP BY persona_id
) pagos_mes ON pe.id = pagos_mes.persona_id
WHERE p.id = ?;

-- =============================================================================
-- 3. CARGOS ASOCIADOS A UN PAGO - Para el detalle de pagos
-- =============================================================================

-- Consulta para obtener los cargos que fueron pagados
SELECT
    ccu.id,
    ccu.monto_pendiente,
    ccu.monto_pagado,
    ccu.estado,
    ccu.fecha_vencimiento,
    ccu.fecha_pago,
    -- Información del cargo original
    cc.id as cargo_id,
    cc.concepto,
    cc.descripcion,
    cc.monto_total,
    cc.fecha_emision,
    cc.fecha_vencimiento as cargo_fecha_vencimiento,
    -- Información del período
    cc.mes,
    cc.ano,
    cc.tipo_cargo,
    -- Información adicional
    cc.interes_mora,
    cc.gastos_cobranza,
    cc.monto_interes_mora,
    cc.monto_gastos_cobranza
FROM cuenta_cobro_unidad ccu
JOIN cuenta_cobro cc ON ccu.cuenta_cobro_id = cc.id
WHERE ccu.pago_id = ?
ORDER BY cc.fecha_emision DESC, cc.mes DESC;

-- =============================================================================
-- 4. DOCUMENTOS ASOCIADOS A UN PAGO
-- =============================================================================

-- Consulta para obtener documentos asociados a un pago
SELECT
    d.id,
    d.nombre_archivo,
    d.nombre_original,
    d.tipo_documento,
    d.ruta_archivo,
    d.url_publica,
    d.tamano_bytes,
    d.mime_type,
    d.fecha_subida,
    d.fecha_modificacion,
    -- Información del usuario que subió
    u.nombre as usuario_subio,
    -- Metadatos adicionales
    d.metadatos,
    d.es_publico,
    d.fecha_expiracion
FROM documento d
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE d.pago_id = ?
ORDER BY d.fecha_subida DESC;

-- =============================================================================
-- 5. TIMELINE/HISTORIAL DE UN PAGO
-- =============================================================================

-- Consulta para obtener el historial completo de un pago
SELECT
    hp.id,
    hp.fecha_evento,
    hp.tipo_evento,
    hp.descripcion,
    hp.estado_anterior,
    hp.estado_nuevo,
    hp.datos_adicionales,
    -- Información del usuario que realizó la acción
    u.id as usuario_id,
    u.nombre as usuario_nombre,
    u.email as usuario_email,
    -- Información adicional
    hp.ip_origen,
    hp.user_agent,
    hp.metadatos
FROM historico_pago hp
LEFT JOIN usuario u ON hp.usuario_id = u.id
WHERE hp.pago_id = ?
ORDER BY hp.fecha_evento DESC;

-- =============================================================================
-- 6. ESTADÍSTICAS GENERALES DEL MÓDULO PAGOS
-- =============================================================================

-- Estadísticas principales para el módulo pagos
SELECT
    COUNT(DISTINCT p.id) as total_pagos,
    -- Por estado
    SUM(CASE WHEN p.estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_aprobados,
    SUM(CASE WHEN p.estado = 'pendiente' THEN 1 ELSE 0 END) as pagos_pendientes,
    SUM(CASE WHEN p.estado = 'rechazado' THEN 1 ELSE 0 END) as pagos_rechazados,
    SUM(CASE WHEN p.estado = 'cancelado' THEN 1 ELSE 0 END) as pagos_cancelados,
    SUM(CASE WHEN p.estado = 'expirado' THEN 1 ELSE 0 END) as pagos_expirados,
    -- Por método de pago
    SUM(CASE WHEN p.metodo_pago = 'transferencia' THEN 1 ELSE 0 END) as pagos_transferencia,
    SUM(CASE WHEN p.metodo_pago = 'tarjeta_credito' THEN 1 ELSE 0 END) as pagos_tarjeta_credito,
    SUM(CASE WHEN p.metodo_pago = 'tarjeta_debito' THEN 1 ELSE 0 END) as pagos_tarjeta_debito,
    SUM(CASE WHEN p.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) as pagos_efectivo,
    -- Montos
    SUM(p.monto) as monto_total,
    AVG(p.monto) as monto_promedio,
    MIN(p.monto) as monto_minimo,
    MAX(p.monto) as monto_maximo,
    -- Por período actual
    SUM(CASE WHEN YEAR(p.fecha_pago) = YEAR(CURRENT_DATE) AND MONTH(p.fecha_pago) = MONTH(CURRENT_DATE) THEN p.monto ELSE 0 END) as monto_mes_actual,
    SUM(CASE WHEN YEAR(p.fecha_pago) = YEAR(CURRENT_DATE) AND MONTH(p.fecha_pago) = MONTH(CURRENT_DATE) THEN 1 ELSE 0 END) as pagos_mes_actual,
    -- Tasas de conversión
    ROUND(
        (SUM(CASE WHEN p.estado = 'aprobado' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) as tasa_aprobacion_porcentaje,
    -- Estadísticas de tiempo
    AVG(CASE WHEN p.estado = 'aprobado' THEN DATEDIFF(p.fecha_pago, p.fecha_creacion) ELSE NULL END) as tiempo_promedio_aprobacion_dias
FROM pago p
WHERE p.comunidad_id = ?;

-- =============================================================================
-- 7. PAGOS CON FILTROS AVANZADOS - Para búsqueda y filtrado
-- =============================================================================

-- Consulta con filtros dinámicos (usar parámetros preparados)
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    -- Información relacionada
    u.numero_unidad,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno) as residente,
    c.nombre as comunidad,
    -- Información adicional
    p.fecha_creacion,
    p.referencia_externa
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
WHERE 1=1
  -- Filtros opcionales (comentar/descomentar según necesidad)
  -- AND p.comunidad_id = ?
  -- AND p.estado = ?
  -- AND p.metodo_pago = ?
  -- AND p.fecha_pago >= ?
  -- AND p.fecha_pago <= ?
  -- AND p.monto >= ?
  -- AND p.monto <= ?
  -- AND (p.concepto LIKE CONCAT('%', ?, '%')
  --      OR u.numero_unidad LIKE CONCAT('%', ?, '%')
  --      OR CONCAT(pe.nombre, ' ', pe.apellido_paterno) LIKE CONCAT('%', ?, '%')
  --      OR p.transaction_id LIKE CONCAT('%', ?, '%'))
ORDER BY p.fecha_creacion DESC;

-- =============================================================================
-- 8. PAGOS PENDIENTES/COBRABLES - Para gestión de cobranza
-- =============================================================================

-- Consulta para pagos pendientes de cobro
SELECT
    ccu.id,
    ccu.unidad_id,
    ccu.cuenta_cobro_id,
    ccu.monto_pendiente,
    ccu.fecha_vencimiento,
    ccu.estado,
    -- Información del cargo
    cc.concepto,
    cc.descripcion,
    cc.monto_total,
    cc.mes,
    cc.ano,
    cc.tipo_cargo,
    -- Información de la unidad/persona
    u.numero_unidad,
    t.nombre as torre_nombre,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno) as residente,
    pe.email,
    pe.telefono,
    -- Información de la comunidad
    com.nombre as comunidad,
    -- Cálculos adicionales
    DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) as dias_vencido,
    CASE
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 90 THEN 'Muy Vencido (>90 días)'
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 30 THEN 'Vencido (31-90 días)'
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 0 THEN 'Vencido (1-30 días)'
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) = 0 THEN 'Vence Hoy'
        ELSE 'Pendiente'
    END as estado_vencimiento,
    -- Intereses y gastos
    cc.interes_mora,
    cc.gastos_cobranza,
    ccu.monto_interes_mora,
    ccu.monto_gastos_cobranza,
    (ccu.monto_pendiente + COALESCE(ccu.monto_interes_mora, 0) + COALESCE(ccu.monto_gastos_cobranza, 0)) as monto_total_cobrar
FROM cuenta_cobro_unidad ccu
JOIN cuenta_cobro cc ON ccu.cuenta_cobro_id = cc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN persona pe ON ccu.persona_id = pe.id
LEFT JOIN comunidad com ON cc.comunidad_id = com.id
WHERE ccu.estado = 'pendiente'
  AND cc.comunidad_id = ?
ORDER BY
    CASE
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 90 THEN 1
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 30 THEN 2
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) > 0 THEN 3
        WHEN DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) = 0 THEN 4
        ELSE 5
    END ASC,
    ccu.fecha_vencimiento ASC,
    ccu.monto_pendiente DESC;

-- =============================================================================
-- 9. HISTORIAL DE PAGOS POR PERÍODO - Para reportes
-- =============================================================================

-- Consulta para obtener historial de pagos por período
SELECT
    DATE_FORMAT(p.fecha_pago, '%Y-%m') as periodo,
    YEAR(p.fecha_pago) as ano,
    MONTH(p.fecha_pago) as mes,
    COUNT(*) as total_pagos,
    SUM(CASE WHEN p.estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_aprobados,
    SUM(CASE WHEN p.estado = 'aprobado' THEN p.monto ELSE 0 END) as monto_total_aprobado,
    AVG(CASE WHEN p.estado = 'aprobado' THEN p.monto ELSE NULL END) as monto_promedio_aprobado,
    -- Por método de pago
    SUM(CASE WHEN p.metodo_pago = 'transferencia' AND p.estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_transferencia,
    SUM(CASE WHEN p.metodo_pago = 'tarjeta_credito' AND p.estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_tarjeta_credito,
    SUM(CASE WHEN p.metodo_pago = 'efectivo' AND p.estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_efectivo,
    -- Estadísticas adicionales
    MIN(CASE WHEN p.estado = 'aprobado' THEN p.fecha_pago ELSE NULL END) as primera_fecha_pago,
    MAX(CASE WHEN p.estado = 'aprobado' THEN p.fecha_pago ELSE NULL END) as ultima_fecha_pago,
    COUNT(DISTINCT CASE WHEN p.estado = 'aprobado' THEN p.unidad_id ELSE NULL END) as unidades_que_pagaron
FROM pago p
WHERE p.comunidad_id = ?
  AND p.fecha_pago >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(p.fecha_pago, '%Y-%m'), YEAR(p.fecha_pago), MONTH(p.fecha_pago)
ORDER BY periodo DESC;

-- =============================================================================
-- 10. PAGOS POR UNIDAD/PERSONA - Para detalle de residentes
-- =============================================================================

-- Consulta para obtener historial completo de pagos de una unidad/persona
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    p.fecha_creacion,
    -- Información del período
    CASE
        WHEN p.fecha_pago IS NOT NULL THEN CONCAT('Pago ', DATE_FORMAT(p.fecha_pago, '%M %Y'))
        ELSE CONCAT('Creado ', DATE_FORMAT(p.fecha_creacion, '%d/%m/%Y'))
    END as descripcion_periodo,
    -- Cargos asociados
    GROUP_CONCAT(
        DISTINCT CONCAT(cc.concepto, ' (', cc.mes, '/', cc.ano, ')')
        ORDER BY cc.fecha_emision
        SEPARATOR '; '
    ) as cargos_asociados,
    -- Estadísticas
    COUNT(ccu.id) as cantidad_cargos,
    SUM(ccu.monto_pagado) as total_cargos_pagados
FROM pago p
LEFT JOIN cuenta_cobro_unidad ccu ON p.id = ccu.pago_id
LEFT JOIN cuenta_cobro cc ON ccu.cuenta_cobro_id = cc.id
WHERE p.unidad_id = ?
   OR p.persona_id = ?
GROUP BY p.id, p.concepto, p.monto, p.fecha_pago, p.estado, p.metodo_pago,
         p.transaction_id, p.gateway, p.fecha_creacion
ORDER BY p.fecha_creacion DESC;

-- =============================================================================
-- 11. PAGOS FALLIDOS/RECHAZADOS - Para análisis de problemas
-- =============================================================================

-- Consulta para analizar pagos fallidos
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.gateway,
    p.intentos_fallidos,
    p.fecha_ultimo_intento,
    p.datos_gateway,
    -- Información de la persona/unidad
    u.numero_unidad,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno) as residente,
    pe.email,
    -- Análisis del error
    CASE
        WHEN p.estado = 'rechazado' THEN 'Pago rechazado por el gateway'
        WHEN p.estado = 'expirado' THEN 'Pago expirado sin completar'
        WHEN p.estado = 'cancelado' THEN 'Pago cancelado por el usuario'
        ELSE 'Estado desconocido'
    END as razon_fallo,
    -- Historial de intentos
    (
        SELECT COUNT(*)
        FROM historico_pago hp
        WHERE hp.pago_id = p.id AND hp.tipo_evento = 'intento_pago'
    ) as total_intentos,
    -- Último evento
    (
        SELECT hp.descripcion
        FROM historico_pago hp
        WHERE hp.pago_id = p.id
        ORDER BY hp.fecha_evento DESC
        LIMIT 1
    ) as ultimo_evento
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
WHERE p.estado IN ('rechazado', 'expirado', 'cancelado')
  AND p.comunidad_id = ?
ORDER BY p.fecha_creacion DESC;

-- =============================================================================
-- 12. EXPORTACIÓN DE DATOS DE PAGOS - Para reportes Excel/CSV
-- =============================================================================

-- Consulta para exportar datos completos de pagos (para Excel/CSV)
SELECT
    'PAGO' as tipo_registro,
    p.id as pago_id,
    p.concepto,
    p.monto,
    p.moneda,
    p.fecha_pago,
    p.fecha_creacion,
    p.fecha_actualizacion,
    p.estado,
    p.metodo_pago,
    p.gateway,
    p.transaction_id,
    p.referencia_externa,
    -- Información de la unidad
    u.numero_unidad,
    u.piso,
    u.tipo_unidad,
    t.nombre as torre,
    e.nombre as edificio,
    -- Información del residente
    pe.rut as residente_rut,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno, ' ', COALESCE(pe.apellido_materno, '')) as residente_nombre,
    pe.email as residente_email,
    pe.telefono as residente_telefono,
    -- Información de la comunidad
    c.nombre as comunidad,
    c.direccion as comunidad_direccion,
    -- Información financiera
    (
        SELECT GROUP_CONCAT(
            CONCAT(cc.concepto, ':', ccu.monto_pagado)
            ORDER BY cc.fecha_emision
            SEPARATOR ';'
        )
        FROM cuenta_cobro_unidad ccu
        JOIN cuenta_cobro cc ON ccu.cuenta_cobro_id = cc.id
        WHERE ccu.pago_id = p.id
    ) as cargos_pagados,
    (
        SELECT SUM(ccu.monto_pagado)
        FROM cuenta_cobro_unidad ccu
        WHERE ccu.pago_id = p.id
    ) as total_cargos_pagados,
    -- Información adicional
    p.comentarios,
    p.url_comprobante,
    p.intentos_fallidos
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
WHERE p.comunidad_id = ?
ORDER BY p.fecha_creacion DESC;

-- =============================================================================
-- 13. PAGOS RECIENTES CON DETALLE - Para dashboard
-- =============================================================================

-- Consulta para obtener pagos recientes con información detallada
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.gateway,
    -- Información resumida
    u.numero_unidad,
    LEFT(CONCAT(pe.nombre, ' ', pe.apellido_paterno), 30) as residente,
    c.nombre as comunidad,
    -- Tiempo transcurrido
    CASE
        WHEN p.fecha_pago IS NOT NULL THEN CONCAT(DATEDIFF(CURRENT_DATE, p.fecha_pago), ' días atrás')
        ELSE CONCAT(DATEDIFF(CURRENT_DATE, p.fecha_creacion), ' días (pendiente)')
    END as tiempo_transcurrido,
    -- Estado formateado
    CASE p.estado
        WHEN 'aprobado' THEN 'Confirmado'
        WHEN 'pendiente' THEN 'Pendiente'
        WHEN 'rechazado' THEN 'Rechazado'
        WHEN 'cancelado' THEN 'Cancelado'
        WHEN 'expirado' THEN 'Expirado'
        ELSE p.estado
    END as estado_formateado
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
WHERE p.fecha_creacion >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
ORDER BY p.fecha_creacion DESC
LIMIT 20;

-- =============================================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_pago_comunidad_fecha ON pago(comunidad_id, fecha_creacion);
CREATE INDEX idx_pago_unidad_id ON pago(unidad_id);
CREATE INDEX idx_pago_persona_id ON pago(persona_id);
CREATE INDEX idx_pago_estado ON pago(estado);
CREATE INDEX idx_pago_metodo_pago ON pago(metodo_pago);
CREATE INDEX idx_pago_fecha_pago ON pago(fecha_pago);
CREATE INDEX idx_pago_gateway ON pago(gateway);
CREATE INDEX idx_cuenta_cobro_unidad_pago ON cuenta_cobro_unidad(pago_id);
CREATE INDEX idx_cuenta_cobro_unidad_estado ON cuenta_cobro_unidad(estado);
CREATE INDEX idx_cuenta_cobro_comunidad ON cuenta_cobro(comunidad_id);
CREATE INDEX idx_historico_pago_pago_fecha ON historico_pago(pago_id, fecha_evento);
CREATE INDEX idx_documento_pago_id ON documento(pago_id);

-- =============================================================================
-- VISTAS OPTIMIZADAS PARA EL MÓDULO PAGOS
-- =============================================================================

-- Vista para listado rápido de pagos
CREATE VIEW vista_pagos_listado AS
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    p.fecha_creacion,
    u.numero_unidad,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno) as residente,
    c.nombre as comunidad,
    CASE
        WHEN p.estado = 'aprobado' THEN DATEDIFF(CURRENT_DATE, p.fecha_pago)
        ELSE DATEDIFF(CURRENT_DATE, p.fecha_creacion)
    END as dias_transcurridos
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id;

-- Vista para estadísticas del módulo pagos
CREATE VIEW vista_pagos_estadisticas AS
SELECT
    comunidad_id,
    COUNT(*) as total_pagos,
    SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as pagos_aprobados,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pagos_pendientes,
    SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) as pagos_rechazados,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio,
    SUM(CASE WHEN YEAR(fecha_pago) = YEAR(CURRENT_DATE) AND MONTH(fecha_pago) = MONTH(CURRENT_DATE) THEN monto ELSE 0 END) as monto_mes_actual,
    ROUND(
        (SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) as tasa_aprobacion_porcentaje
FROM pago
GROUP BY comunidad_id;

-- Vista para pagos pendientes de cobro
CREATE VIEW vista_pagos_pendientes AS
SELECT
    ccu.id,
    ccu.unidad_id,
    ccu.monto_pendiente,
    ccu.fecha_vencimiento,
    u.numero_unidad,
    t.nombre as torre,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno) as residente,
    cc.concepto,
    cc.mes,
    cc.ano,
    DATEDIFF(CURRENT_DATE, ccu.fecha_vencimiento) as dias_vencido,
    (ccu.monto_pendiente + COALESCE(ccu.monto_interes_mora, 0) + COALESCE(ccu.monto_gastos_cobranza, 0)) as monto_total_cobrar,
    com.nombre as comunidad
FROM cuenta_cobro_unidad ccu
JOIN cuenta_cobro cc ON ccu.cuenta_cobro_id = cc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN persona pe ON ccu.persona_id = pe.id
LEFT JOIN comunidad com ON cc.comunidad_id = com.id
WHERE ccu.estado = 'pendiente';

-- Vista para detalle completo de pagos
CREATE VIEW vista_pagos_detalle AS
SELECT
    p.id,
    p.concepto,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.metodo_pago,
    p.transaction_id,
    p.gateway,
    p.fecha_creacion,
    u.numero_unidad,
    u.piso,
    t.nombre as torre,
    e.nombre as edificio,
    CONCAT(pe.nombre, ' ', pe.apellido_paterno, ' ', COALESCE(pe.apellido_materno, '')) as residente,
    pe.email,
    pe.telefono,
    c.nombre as comunidad
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona pe ON p.persona_id = pe.id
LEFT JOIN comunidad c ON p.comunidad_id = c.id;</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccfrontend\queries_pagos.sql
-- ============================================
-- VISTAS Y ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- VISTAS RECOMENDADAS

-- Vista para estadísticas de comunidades (reutilizable)
CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    c.id as comunidad_id,
    c.nombre,
    COUNT(DISTINCT u.id) as total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) as unidades_ocupadas,
    COUNT(DISTINCT CASE WHEN mc.rol IN ('residente', 'propietario') AND mc.activo = 1 THEN mc.persona_id END) as total_residentes,
    COALESCE(SUM(CASE WHEN cu.estado = 'pendiente' THEN cu.saldo ELSE 0 END), 0) as saldo_pendiente,
    -- Ingresos del mes actual
    COALESCE((
        SELECT SUM(cu2.monto_total) 
        FROM cargo_unidad cu2 
        INNER JOIN unidad u2 ON u2.id = cu2.unidad_id
        INNER JOIN edificio e2 ON e2.id = u2.edificio_id
        WHERE e2.comunidad_id = c.id 
        AND MONTH(cu2.created_at) = MONTH(CURDATE()) 
        AND YEAR(cu2.created_at) = YEAR(CURDATE())
    ), 0) as ingresos_mensuales,
    -- Gastos del mes actual  
    COALESCE((
        SELECT SUM(monto) 
        FROM gasto g2 
        WHERE g2.comunidad_id = c.id 
        AND MONTH(g2.fecha) = MONTH(CURDATE()) 
        AND YEAR(g2.fecha) = YEAR(CURDATE())
    ), 0) as gastos_mensuales,
    -- Cálculo de morosidad
    CASE 
        WHEN COUNT(DISTINCT u.id) > 0 THEN
            ROUND((COUNT(DISTINCT CASE WHEN cu.estado = 'vencido' THEN u.id END) * 100.0) / COUNT(DISTINCT u.id), 2)
        ELSE 0 
    END as morosidad
FROM comunidad c
LEFT JOIN edificio e ON e.comunidad_id = c.id
LEFT JOIN unidad u ON u.edificio_id = e.id
LEFT JOIN membresia_comunidad mc ON mc.comunidad_id = c.id
LEFT JOIN cargo_unidad cu ON cu.unidad_id = u.id
WHERE c.estado != 'Eliminada'
GROUP BY c.id, c.nombre;

-- Vista para listado simplificado de comunidades
CREATE VIEW vista_comunidades_lista AS
SELECT 
    c.id,
    c.nombre,
    c.direccion,
    c.comuna,
    c.region,
    c.tipo,
    c.estado,
    c.administrador_nombre as administrador,
    c.telefono_comunidad as telefono,
    c.email_comunidad as email,
    c.imagen_url as imagen,
    c.created_at as fechaCreacion,
    c.updated_at as fechaActualizacion,
    COALESCE(stats.total_unidades, 0) as totalUnidades,
    COALESCE(stats.unidades_ocupadas, 0) as unidadesOcupadas,
    COALESCE(stats.total_residentes, 0) as totalResidentes,
    COALESCE(stats.saldo_pendiente, 0) as saldoPendiente,
    COALESCE(stats.ingresos_mensuales, 0) as ingresosMensuales,
    COALESCE(stats.gastos_mensuales, 0) as gastosMensuales,
    COALESCE(stats.morosidad, 0) as morosidad
FROM comunidad c
LEFT JOIN vista_estadisticas_comunidad stats ON stats.comunidad_id = c.id
WHERE c.estado != 'Eliminada';

-- Vista para residentes con información completa
CREATE VIEW vista_residentes_comunidad AS
SELECT 
    p.id,
    CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
    p.rut,
    p.telefono,
    p.email,
    mc.rol as tipo,
    CASE WHEN mc.activo = 1 THEN 'Activo' ELSE 'Inactivo' END as estado,
    u.id as unidad_id,
    u.numero as unidad_numero,
    e.id as edificio_id,
    e.nombre as edificio_nombre,
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    CONCAT(e.nombre, '-', u.numero) as unidad_completa
FROM persona p
INNER JOIN membresia_comunidad mc ON mc.persona_id = p.id
INNER JOIN unidad u ON u.id = mc.unidad_id
INNER JOIN edificio e ON e.id = u.edificio_id
INNER JOIN comunidad c ON c.id = e.comunidad_id
WHERE c.estado != 'Eliminada';

-- Vista para flujo financiero mensual
CREATE VIEW vista_flujo_financiero AS
SELECT 
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    DATE_FORMAT(CURDATE(), '%Y-%m') as periodo,
    COALESCE(ingresos.total, 0) as ingresos_periodo,
    COALESCE(gastos.total, 0) as gastos_periodo,
    (COALESCE(ingresos.total, 0) - COALESCE(gastos.total, 0)) as flujo_neto,
    COALESCE(pendientes.total, 0) as saldo_pendiente
FROM comunidad c
LEFT JOIN (
    SELECT 
        e.comunidad_id,
        SUM(cu.monto) as total
    FROM cargo_unidad cu
    INNER JOIN unidad u ON u.id = cu.unidad_id
    INNER JOIN edificio e ON e.id = u.edificio_id
    WHERE MONTH(cu.created_at) = MONTH(CURDATE())
    AND YEAR(cu.created_at) = YEAR(CURDATE())
    GROUP BY e.comunidad_id
) ingresos ON ingresos.comunidad_id = c.id
LEFT JOIN (
    SELECT 
        g.comunidad_id,
        SUM(g.monto) as total
    FROM gasto g
    WHERE MONTH(g.fecha_gasto) = MONTH(CURDATE())
    AND YEAR(g.fecha_gasto) = YEAR(CURDATE())
    GROUP BY g.comunidad_id
) gastos ON gastos.comunidad_id = c.id
LEFT JOIN (
    SELECT 
        e.comunidad_id,
        SUM(cu.monto) as total
    FROM cargo_unidad cu
    INNER JOIN unidad u ON u.id = cu.unidad_id
    INNER JOIN edificio e ON e.id = u.edificio_id
    WHERE cu.estado = 'Pendiente'
    GROUP BY e.comunidad_id
) pendientes ON pendientes.comunidad_id = c.id
WHERE c.estado = 'Activa';

-- ============================================
-- ÍNDICES RECOMENDADOS PARA RENDIMIENTO
-- ============================================

-- Índices principales para tabla comunidad
CREATE INDEX idx_comunidad_estado ON comunidad(estado);
CREATE INDEX idx_comunidad_tipo ON comunidad(tipo);
CREATE INDEX idx_comunidad_comuna ON comunidad(comuna);
CREATE INDEX idx_comunidad_nombre ON comunidad(nombre);
CREATE INDEX idx_comunidad_admin ON comunidad(administrador_nombre);

-- Índices para búsqueda y filtros
CREATE INDEX idx_comunidad_busqueda ON comunidad(nombre, direccion, administrador_nombre);
CREATE INDEX idx_comunidad_ubicacion ON comunidad(comuna, region);

-- Índices para tablas relacionadas
CREATE INDEX idx_edificio_comunidad ON edificio(comunidad_id);
CREATE INDEX idx_unidad_edificio ON unidad(edificio_id);
CREATE INDEX idx_unidad_activa ON unidad(activa);
CREATE INDEX idx_membresia_comunidad ON membresia_comunidad(comunidad_id);
CREATE INDEX idx_membresia_persona ON membresia_comunidad(persona_id);
CREATE INDEX idx_membresia_activo ON membresia_comunidad(activo);

-- Índices para operaciones financieras
CREATE INDEX idx_cargo_unidad_fecha ON cargo_unidad(created_at);
CREATE INDEX idx_cargo_unidad_estado ON cargo_unidad(estado);
CREATE INDEX idx_gasto_comunidad_fecha ON gasto(comunidad_id, fecha);

-- Índices para amenidades y documentos
CREATE INDEX idx_amenidad_comunidad ON amenidad(comunidad_id);
CREATE INDEX idx_documento_comunidad ON documento(comunidad_id);

-- Índices para bitácora y auditoría
CREATE INDEX idx_bitacora_comunidad_fecha ON bitacora_conserjeria(comunidad_id, fecha_hora);
CREATE INDEX idx_auditoria_comunidad_fecha ON auditoria_comunidad(comunidad_id, fecha_accion);

-- ============================================
-- PROCEDURES ALMACENADOS RECOMENDADOS
-- ============================================

-- Procedure para calcular estadísticas de una comunidad
DELIMITER //
CREATE PROCEDURE sp_calcular_estadisticas_comunidad(IN p_comunidad_id BIGINT)
BEGIN
    SELECT 
        total_unidades,
        unidades_ocupadas,
        total_residentes,
        saldo_pendiente,
        ingresos_mensuales,
        gastos_mensuales,
        morosidad
    FROM vista_estadisticas_comunidad 
    WHERE comunidad_id = p_comunidad_id;
END //
DELIMITER ;

-- Procedure para obtener resumen financiero
DELIMITER //
CREATE PROCEDURE sp_resumen_financiero_comunidad(
    IN p_comunidad_id BIGINT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        SUM(CASE WHEN cu.estado = 'Pagado' THEN cu.monto ELSE 0 END) as ingresos_cobrados,
        SUM(CASE WHEN cu.estado = 'Pendiente' THEN cu.monto ELSE 0 END) as ingresos_pendientes,
        SUM(CASE WHEN cu.estado = 'Vencida' THEN cu.monto ELSE 0 END) as ingresos_vencidos,
        (SELECT SUM(g.monto) FROM gasto g 
         WHERE g.comunidad_id = p_comunidad_id 
         AND g.fecha_gasto BETWEEN p_fecha_inicio AND p_fecha_fin) as gastos_total
    FROM cargo_unidad cu
    INNER JOIN unidad u ON u.id = cu.unidad_id
    INNER JOIN edificio e ON e.id = u.edificio_id
    WHERE e.comunidad_id = p_comunidad_id
    AND cu.created_at BETWEEN p_fecha_inicio AND p_fecha_fin;
END //
DELIMITER ;

-- Procedure para búsqueda inteligente
DELIMITER //
CREATE PROCEDURE sp_buscar_comunidades(IN p_termino VARCHAR(255))
BEGIN
    SELECT 
        c.*,
        CASE 
            WHEN c.nombre LIKE CONCAT(p_termino, '%') THEN 1
            WHEN c.nombre LIKE CONCAT('%', p_termino, '%') THEN 2
            WHEN c.direccion LIKE CONCAT('%', p_termino, '%') THEN 3
            WHEN c.administrador_nombre LIKE CONCAT('%', p_termino, '%') THEN 4
            ELSE 5
        END as relevancia_orden
    FROM vista_comunidades_lista c
    WHERE c.nombre LIKE CONCAT('%', p_termino, '%')
       OR c.direccion LIKE CONCAT('%', p_termino, '%')
       OR c.administrador_nombre LIKE CONCAT('%', p_termino, '%')
       OR c.comuna LIKE CONCAT('%', p_termino, '%')
    ORDER BY relevancia_orden, c.nombre
    LIMIT 50;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================

-- Trigger para auditar cambios en comunidad
DELIMITER //
CREATE TRIGGER tr_comunidad_auditoria_update
AFTER UPDATE ON comunidad
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_comunidad (
        comunidad_id,
        usuario_id,
        accion,
        campos_modificados,
        valores_anteriores,
        valores_nuevos,
        fecha_accion
    ) VALUES (
        NEW.id,
        @usuario_id, -- Variable de sesión
        'UPDATE',
        JSON_OBJECT(
            'nombre', IF(OLD.nombre != NEW.nombre, 'changed', NULL),
            'direccion', IF(OLD.direccion != NEW.direccion, 'changed', NULL),
            'estado', IF(OLD.estado != NEW.estado, 'changed', NULL)
        ),
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'direccion', OLD.direccion,
            'estado', OLD.estado
        ),
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'direccion', NEW.direccion,
            'estado', NEW.estado
        ),
        NOW()
    );
END //
DELIMITER ;
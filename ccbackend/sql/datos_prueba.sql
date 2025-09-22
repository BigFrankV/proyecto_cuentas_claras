-- ============================================
-- DATOS DE PRUEBA PARA FRONTEND DE COMUNIDADES
-- ============================================

-- Limpiar datos existentes (opcional - comentar si no quieres borrar)
-- DELETE FROM documento WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM gasto WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM cargo_unidad WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM tenencia_unidad WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM membresia_comunidad WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM unidad WHERE edificio_id IN (SELECT id FROM edificio WHERE comunidad_id IN (1, 2, 3));
-- DELETE FROM edificio WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM amenidad WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM configuracion_interes WHERE comunidad_id IN (1, 2, 3);
-- DELETE FROM persona WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
-- DELETE FROM categoria_gasto WHERE id IN (1, 2, 3, 4, 5);
-- DELETE FROM comunidad WHERE id IN (1, 2, 3);

-- ============================================
-- 1. COMUNIDADES
-- ============================================
INSERT INTO comunidad (id, razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto, moneda, tz, created_at, updated_at) VALUES
(1, 'Condominio Las Palmas', '12345678', '9', 'Administración de edificios', 'Av. Las Condes 1234, Las Condes, Santiago', 'admin@laspalmas.cl', '+56 9 8765 4321', 'CLP', 'America/Santiago', '2023-01-15 10:30:00', '2024-09-15 14:20:00'),
(2, 'Residencial Plaza Norte', '87654321', '0', 'Condominio residencial', 'Av. Providencia 567, Providencia, Santiago', 'contacto@plazanorte.cl', '+56 9 7654 3210', 'CLP', 'America/Santiago', '2023-03-20 09:15:00', '2024-09-10 16:45:00'),
(3, 'Torres del Sol', '11223344', '5', 'Edificios habitacionales', 'Calle Principal 890, Ñuñoa, Santiago', 'info@torresdelsol.cl', '+56 9 6543 2109', 'CLP', 'America/Santiago', '2023-06-10 11:20:00', '2024-09-05 13:30:00');

-- ============================================
-- 2. EDIFICIOS
-- ============================================
INSERT INTO edificio (id, comunidad_id, nombre, direccion, codigo, created_at, updated_at) VALUES
-- Condominio Las Palmas
(1, 1, 'Torre A', 'Av. Las Condes 1234-A, Las Condes', 'TA', '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(2, 1, 'Torre B', 'Av. Las Condes 1234-B, Las Condes', 'TB', '2023-01-15 10:30:00', '2024-01-15 10:30:00'),

-- Residencial Plaza Norte
(3, 2, 'Edificio Principal', 'Av. Providencia 567, Providencia', 'EP', '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(4, 2, 'Edificio Anexo', 'Av. Providencia 567-A, Providencia', 'EA', '2023-03-20 09:15:00', '2024-03-20 09:15:00'),

-- Torres del Sol
(5, 3, 'Torre Norte', 'Calle Principal 890-N, Ñuñoa', 'TN', '2023-06-10 11:20:00', '2024-06-10 11:20:00'),
(6, 3, 'Torre Sur', 'Calle Principal 890-S, Ñuñoa', 'TS', '2023-06-10 11:20:00', '2024-06-10 11:20:00');

-- ============================================
-- 3. UNIDADES
-- ============================================
INSERT INTO unidad (id, edificio_id, codigo, alicuota, activa, created_at, updated_at) VALUES
-- Torre A (Edificio 1)
(1, 1, '101', 0.025, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(2, 1, '102', 0.025, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(3, 1, '201', 0.030, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(4, 1, '202', 0.030, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(5, 1, '301', 0.035, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),

-- Torre B (Edificio 2)
(6, 2, '101', 0.025, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(7, 2, '102', 0.025, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(8, 2, '201', 0.030, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(9, 2, '202', 0.030, 1, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(10, 2, '301', 0.035, 0, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),

-- Edificio Principal (Edificio 3)
(11, 3, 'A-01', 0.040, 1, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(12, 3, 'A-02', 0.040, 1, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(13, 3, 'B-01', 0.040, 1, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(14, 3, 'B-02', 0.040, 1, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),

-- Torre Norte (Edificio 5)
(15, 5, '1A', 0.033, 1, '2023-06-10 11:20:00', '2024-06-10 11:20:00'),
(16, 5, '1B', 0.033, 1, '2023-06-10 11:20:00', '2024-06-10 11:20:00'),
(17, 5, '2A', 0.033, 1, '2023-06-10 11:20:00', '2024-06-10 11:20:00'),
(18, 5, '2B', 0.033, 1, '2023-06-10 11:20:00', '2024-06-10 11:20:00');

-- ============================================
-- 4. AMENIDADES
-- ============================================
INSERT INTO amenidad (id, comunidad_id, nombre, reglas, requiere_aprobacion, tarifa, created_at, updated_at) VALUES
-- Condominio Las Palmas
(1, 1, 'Piscina', 'Horario: 6:00 a 22:00. Máximo 4 personas por unidad.', 0, 0.00, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(2, 1, 'Gimnasio', 'Horario: 5:00 a 23:00. Uso exclusivo residentes.', 0, 0.00, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(3, 1, 'Salón de Eventos', 'Capacidad máxima 50 personas. Reserva con 15 días anticipación.', 1, 50000.00, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(4, 1, 'Cancha de Tenis', 'Horario: 8:00 a 20:00. Máximo 2 horas por reserva.', 1, 15000.00, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),
(5, 1, 'Área BBQ', 'Máximo 8 personas. Limpieza posterior obligatoria.', 1, 25000.00, '2023-01-15 10:30:00', '2024-01-15 10:30:00'),

-- Residencial Plaza Norte
(6, 2, 'Quincho', 'Capacidad 20 personas. Incluye parrilla y mesas.', 1, 30000.00, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(7, 2, 'Sala Multiuso', 'Reuniones y actividades comunitarias.', 1, 20000.00, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),
(8, 2, 'Piscina Infantil', 'Solo para menores de 12 años con adulto responsable.', 0, 0.00, '2023-03-20 09:15:00', '2024-03-20 09:15:00'),

-- Torres del Sol
(9, 3, 'Terraza Común', 'Área de descanso con vista panorámica.', 0, 0.00, '2023-06-10 11:20:00', '2024-06-10 11:20:00'),
(10, 3, 'Sala de Juegos', 'Mesa de pool, ping pong y juegos de mesa.', 0, 0.00, '2023-06-10 11:20:00', '2024-06-10 11:20:00');

-- ============================================
-- 5. PERSONAS
-- ============================================
INSERT INTO persona (id, rut, dv, nombres, apellidos, email, telefono, created_at, updated_at) VALUES
(1, '12345678', '9', 'Juan Carlos', 'Pérez González', 'juan.perez@email.com', '+56 9 1234 5678', '2023-01-20 10:00:00', '2024-01-20 10:00:00'),
(2, '87654321', '0', 'María Elena', 'González Rodríguez', 'maria.gonzalez@email.com', '+56 9 2345 6789', '2023-01-21 11:00:00', '2024-01-21 11:00:00'),
(3, '11223344', '5', 'Carlos Alberto', 'López Martínez', 'carlos.lopez@email.com', '+56 9 3456 7890', '2023-01-22 12:00:00', '2024-01-22 12:00:00'),
(4, '44332211', '6', 'Ana Sofía', 'Fernández Silva', 'ana.fernandez@email.com', '+56 9 4567 8901', '2023-01-23 13:00:00', '2024-01-23 13:00:00'),
(5, '55667788', '3', 'Roberto', 'Muñoz Torres', 'roberto.munoz@email.com', '+56 9 5678 9012', '2023-01-24 14:00:00', '2024-01-24 14:00:00'),
(6, '99887766', '1', 'Patricia', 'Contreras Soto', 'patricia.contreras@email.com', '+56 9 6789 0123', '2023-01-25 15:00:00', '2024-01-25 15:00:00'),
(7, '66554433', '8', 'Diego', 'Ramírez Castro', 'diego.ramirez@email.com', '+56 9 7890 1234', '2023-01-26 16:00:00', '2024-01-26 16:00:00'),
(8, '33445566', '2', 'Francisca', 'Herrera Morales', 'francisca.herrera@email.com', '+56 9 8901 2345', '2023-01-27 17:00:00', '2024-01-27 17:00:00'),
(9, '77889900', '4', 'Andrés', 'Vega Rojas', 'andres.vega@email.com', '+56 9 9012 3456', '2023-01-28 18:00:00', '2024-01-28 18:00:00'),
(10, '00998877', '7', 'Camila', 'Sandoval Díaz', 'camila.sandoval@email.com', '+56 9 0123 4567', '2023-01-29 19:00:00', '2024-01-29 19:00:00');

-- ============================================
-- 6. MEMBRESÍAS COMUNIDAD
-- ============================================
INSERT INTO membresia_comunidad (id, persona_id, comunidad_id, rol, activo, created_at, updated_at) VALUES
-- Condominio Las Palmas
(1, 1, 1, 'propietario', 1, '2023-01-20 10:00:00', '2024-01-20 10:00:00'),
(2, 2, 1, 'residente', 1, '2023-01-21 11:00:00', '2024-01-21 11:00:00'),
(3, 3, 1, 'propietario', 1, '2023-01-22 12:00:00', '2024-01-22 12:00:00'),
(4, 4, 1, 'administrador', 1, '2023-01-23 13:00:00', '2024-01-23 13:00:00'),

-- Residencial Plaza Norte
(5, 5, 2, 'propietario', 1, '2023-03-25 14:00:00', '2024-03-25 14:00:00'),
(6, 6, 2, 'residente', 1, '2023-03-26 15:00:00', '2024-03-26 15:00:00'),
(7, 7, 2, 'propietario', 1, '2023-03-27 16:00:00', '2024-03-27 16:00:00'),

-- Torres del Sol
(8, 8, 3, 'propietario', 1, '2023-06-15 17:00:00', '2024-06-15 17:00:00'),
(9, 9, 3, 'residente', 1, '2023-06-16 18:00:00', '2024-06-16 18:00:00'),
(10, 10, 3, 'propietario', 1, '2023-06-17 19:00:00', '2024-06-17 19:00:00');

-- ============================================
-- 7. TENENCIA UNIDAD
-- ============================================
INSERT INTO tenencia_unidad (id, persona_id, unidad_id, tipo, comunidad_id, created_at, updated_at) VALUES
-- Condominio Las Palmas
(1, 1, 1, 'propietario', 1, '2023-01-20 10:00:00', '2024-01-20 10:00:00'),
(2, 2, 2, 'arrendatario', 1, '2023-01-21 11:00:00', '2024-01-21 11:00:00'),
(3, 3, 3, 'propietario', 1, '2023-01-22 12:00:00', '2024-01-22 12:00:00'),
(4, 4, 6, 'propietario', 1, '2023-01-23 13:00:00', '2024-01-23 13:00:00'),

-- Residencial Plaza Norte
(5, 5, 11, 'propietario', 2, '2023-03-25 14:00:00', '2024-03-25 14:00:00'),
(6, 6, 12, 'arrendatario', 2, '2023-03-26 15:00:00', '2024-03-26 15:00:00'),
(7, 7, 13, 'propietario', 2, '2023-03-27 16:00:00', '2024-03-27 16:00:00'),

-- Torres del Sol
(8, 8, 15, 'propietario', 3, '2023-06-15 17:00:00', '2024-06-15 17:00:00'),
(9, 9, 16, 'arrendatario', 3, '2023-06-16 18:00:00', '2024-06-16 18:00:00'),
(10, 10, 17, 'propietario', 3, '2023-06-17 19:00:00', '2024-06-17 19:00:00');

-- ============================================
-- 8. CATEGORÍAS DE GASTO
-- ============================================
INSERT INTO categoria_gasto (id, nombre, descripcion, created_at, updated_at) VALUES
(1, 'Servicios Básicos', 'Agua, luz, gas, internet', '2023-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 'Mantenimiento', 'Reparaciones, jardinería, limpieza', '2023-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 'Administración', 'Gastos administrativos, honorarios', '2023-01-01 00:00:00', '2024-01-01 00:00:00'),
(4, 'Seguridad', 'Guardias, cámaras, sistemas de seguridad', '2023-01-01 00:00:00', '2024-01-01 00:00:00'),
(5, 'Seguros', 'Pólizas de seguro del condominio', '2023-01-01 00:00:00', '2024-01-01 00:00:00');

-- ============================================
-- 9. GASTOS
-- ============================================
INSERT INTO gasto (id, comunidad_id, categoria_id, descripcion, monto, fecha, created_at, updated_at) VALUES
-- Gastos Condominio Las Palmas (Septiembre 2024)
(1, 1, 1, 'Cuenta de luz común', 280000.00, '2024-09-05', '2024-09-05 10:00:00', '2024-09-05 10:00:00'),
(2, 1, 1, 'Cuenta de agua', 150000.00, '2024-09-06', '2024-09-06 11:00:00', '2024-09-06 11:00:00'),
(3, 1, 2, 'Mantención ascensores', 320000.00, '2024-09-10', '2024-09-10 14:00:00', '2024-09-10 14:00:00'),
(4, 1, 2, 'Jardinería y poda', 180000.00, '2024-09-12', '2024-09-12 09:00:00', '2024-09-12 09:00:00'),
(5, 1, 3, 'Honorarios administrador', 400000.00, '2024-09-01', '2024-09-01 08:00:00', '2024-09-01 08:00:00'),

-- Gastos Residencial Plaza Norte (Septiembre 2024)
(6, 2, 1, 'Servicios básicos', 220000.00, '2024-09-03', '2024-09-03 10:00:00', '2024-09-03 10:00:00'),
(7, 2, 2, 'Reparación bomba agua', 450000.00, '2024-09-08', '2024-09-08 15:00:00', '2024-09-08 15:00:00'),
(8, 2, 3, 'Gastos administrativos', 200000.00, '2024-09-01', '2024-09-01 08:00:00', '2024-09-01 08:00:00'),

-- Gastos Torres del Sol (Septiembre 2024)
(9, 3, 1, 'Electricidad común', 190000.00, '2024-09-04', '2024-09-04 10:00:00', '2024-09-04 10:00:00'),
(10, 3, 2, 'Limpieza general', 250000.00, '2024-09-15', '2024-09-15 16:00:00', '2024-09-15 16:00:00'),

-- Gastos meses anteriores para flujo de caja
(11, 1, 1, 'Servicios agosto', 260000.00, '2024-08-05', '2024-08-05 10:00:00', '2024-08-05 10:00:00'),
(12, 1, 2, 'Mantenimiento agosto', 300000.00, '2024-08-10', '2024-08-10 14:00:00', '2024-08-10 14:00:00'),
(13, 1, 3, 'Administración agosto', 400000.00, '2024-08-01', '2024-08-01 08:00:00', '2024-08-01 08:00:00'),
(14, 1, 1, 'Servicios julio', 240000.00, '2024-07-05', '2024-07-05 10:00:00', '2024-07-05 10:00:00'),
(15, 1, 2, 'Mantenimiento julio', 280000.00, '2024-07-10', '2024-07-10 14:00:00', '2024-07-10 14:00:00');

-- ============================================
-- 10. CARGOS A UNIDADES (Para ingresos)
-- ============================================
INSERT INTO cargo_unidad (id, emision_id, comunidad_id, unidad_id, monto_total, saldo, estado, interes_acumulado, created_at, updated_at) VALUES
-- Cargos Septiembre 2024 - Condominio Las Palmas
(1, NULL, 1, 1, 85000.00, 0.00, 'pagado', 0.00, '2024-09-01 00:00:00', '2024-09-05 10:00:00'),
(2, NULL, 1, 2, 85000.00, 85000.00, 'pendiente', 0.00, '2024-09-01 00:00:00', '2024-09-01 00:00:00'),
(3, NULL, 1, 3, 95000.00, 0.00, 'pagado', 0.00, '2024-09-01 00:00:00', '2024-09-08 14:00:00'),
(4, NULL, 1, 6, 85000.00, 42500.00, 'parcial', 0.00, '2024-09-01 00:00:00', '2024-09-10 16:00:00'),

-- Cargos Septiembre 2024 - Residencial Plaza Norte
(5, NULL, 2, 11, 120000.00, 0.00, 'pagado', 0.00, '2024-09-01 00:00:00', '2024-09-03 12:00:00'),
(6, NULL, 2, 12, 120000.00, 120000.00, 'pendiente', 0.00, '2024-09-01 00:00:00', '2024-09-01 00:00:00'),
(7, NULL, 2, 13, 120000.00, 60000.00, 'parcial', 0.00, '2024-09-01 00:00:00', '2024-09-12 09:00:00'),

-- Cargos Septiembre 2024 - Torres del Sol
(8, NULL, 3, 15, 75000.00, 0.00, 'pagado', 0.00, '2024-09-01 00:00:00', '2024-09-02 11:00:00'),
(9, NULL, 3, 16, 75000.00, 75000.00, 'pendiente', 0.00, '2024-09-01 00:00:00', '2024-09-01 00:00:00'),
(10, NULL, 3, 17, 75000.00, 0.00, 'pagado', 0.00, '2024-09-01 00:00:00', '2024-09-05 15:00:00'),

-- Cargos meses anteriores para estadísticas
(11, NULL, 1, 1, 85000.00, 0.00, 'pagado', 0.00, '2024-08-01 00:00:00', '2024-08-05 10:00:00'),
(12, NULL, 1, 2, 85000.00, 0.00, 'pagado', 0.00, '2024-08-01 00:00:00', '2024-08-08 14:00:00'),
(13, NULL, 1, 3, 95000.00, 0.00, 'pagado', 0.00, '2024-08-01 00:00:00', '2024-08-10 16:00:00'),
(14, NULL, 1, 1, 85000.00, 0.00, 'pagado', 0.00, '2024-07-01 00:00:00', '2024-07-05 10:00:00'),
(15, NULL, 1, 2, 85000.00, 0.00, 'pagado', 0.00, '2024-07-01 00:00:00', '2024-07-08 14:00:00');

-- ============================================
-- 11. CONFIGURACIÓN DE INTERESES
-- ============================================
INSERT INTO configuracion_interes (id, comunidad_id, aplica_desde, tasa_mensual, metodo, tope_mensual, created_at, updated_at) VALUES
(1, 1, '2024-01-01', 0.02, 'mensual', 50.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(2, 2, '2024-01-01', 0.015, 'mensual', 40.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(3, 3, '2024-01-01', 0.025, 'mensual', 60.00, '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- ============================================
-- 12. DOCUMENTOS
-- ============================================
INSERT INTO documento (id, comunidad_id, titulo, tipo, url, periodo, visibilidad, created_at, updated_at) VALUES
-- Condominio Las Palmas
(1, 1, 'Reglamento Interno 2024', 'reglamento', '/documentos/reglamento-las-palmas-2024.pdf', '2024', 'publico', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
(2, 1, 'Acta Asamblea Enero 2024', 'acta', '/documentos/acta-enero-2024-las-palmas.pdf', '2024-01', 'publico', '2024-01-30 14:00:00', '2024-01-30 14:00:00'),
(3, 1, 'Estados Financieros Q1 2024', 'financiero', '/documentos/estados-financieros-q1-2024.pdf', '2024-Q1', 'propietarios', '2024-04-15 16:00:00', '2024-04-15 16:00:00'),
(4, 1, 'Manual de Convivencia', 'manual', '/documentos/manual-convivencia-las-palmas.pdf', '2024', 'publico', '2024-02-01 09:00:00', '2024-02-01 09:00:00'),

-- Residencial Plaza Norte
(5, 2, 'Reglamento Plaza Norte', 'reglamento', '/documentos/reglamento-plaza-norte.pdf', '2024', 'publico', '2024-03-20 11:00:00', '2024-03-20 11:00:00'),
(6, 2, 'Acta Asamblea Marzo 2024', 'acta', '/documentos/acta-marzo-2024-plaza-norte.pdf', '2024-03', 'publico', '2024-03-25 15:00:00', '2024-03-25 15:00:00'),

-- Torres del Sol
(7, 3, 'Reglamento Torres del Sol', 'reglamento', '/documentos/reglamento-torres-sol.pdf', '2024', 'publico', '2024-06-10 12:00:00', '2024-06-10 12:00:00'),
(8, 3, 'Presupuesto Anual 2024', 'presupuesto', '/documentos/presupuesto-2024-torres-sol.pdf', '2024', 'propietarios', '2024-06-15 14:00:00', '2024-06-15 14:00:00');

-- ============================================
-- CONSULTA DE VERIFICACIÓN
-- ============================================
-- Verificar que los datos se insertaron correctamente
SELECT 'Comunidades insertadas:' as verificacion, COUNT(*) as cantidad FROM comunidad WHERE id IN (1, 2, 3)
UNION ALL
SELECT 'Edificios insertados:', COUNT(*) FROM edificio WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Unidades insertadas:', COUNT(*) FROM unidad WHERE edificio_id IN (SELECT id FROM edificio WHERE comunidad_id IN (1, 2, 3))
UNION ALL
SELECT 'Amenidades insertadas:', COUNT(*) FROM amenidad WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Personas insertadas:', COUNT(*) FROM persona WHERE id BETWEEN 1 AND 10
UNION ALL
SELECT 'Membresías insertadas:', COUNT(*) FROM membresia_comunidad WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Tenencias insertadas:', COUNT(*) FROM tenencia_unidad WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Gastos insertados:', COUNT(*) FROM gasto WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Cargos insertados:', COUNT(*) FROM cargo_unidad WHERE comunidad_id IN (1, 2, 3)
UNION ALL
SELECT 'Documentos insertados:', COUNT(*) FROM documento WHERE comunidad_id IN (1, 2, 3);
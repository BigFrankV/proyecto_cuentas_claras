-- *********************************************************************************
-- ETAPA 1: Entidades Base (No tienen FK de salida)
-- *********************************************************************************

-- 1. PERSONA (10 Filas)
INSERT INTO `persona` (`id`, `rut`, `dv`, `nombres`, `apellidos`, `email`, `telefono`) VALUES
(1, '18514420', '8', 'Patricio', 'Quintanilla', 'pat.quintanilla@duocuc.cl', '+56987654321'),
(2, '11243882', '3', 'Elisabet', 'Robledo', 'elisabet@email.cl', '+56912345678'),
(3, '21141366', '2', 'Dalila', 'Trillo', 'dalila@email.cl', '+56923456789'),
(4, '9793463', '0', 'Isidora', 'Sedano', 'isidora@email.cl', '+56934567890'),
(5, '2569079', '6', 'Sigfrido', 'Molins', 'sigfrido@email.cl', '+56945678901'),
(6, '24317602', '6', 'José', 'Álvaro', 'jose@conserje.cl', '+56956789012'),
(7, '21596168', '0', 'Jordi', 'Piñol', 'jordi@email.cl', '+56967890123'),
(8, '17147778', '6', 'Flora', 'Olivares', 'flora@admin.cl', '+56978901234'),
(9, '9974052', '3', 'Lina', 'Alonso', 'lina@email.cl', '+56989012345'),
(10, '11788735', '9', 'Alejandro', 'Barros', 'alejandro@email.cl', '+56990123456');

-- 2. USUARIO (10 Filas - Ligadas a Persona 1-10)
INSERT INTO `usuario` (`id`, `persona_id`, `username`, `hash_password`, `email`, `activo`, `is_superadmin`) VALUES
(1, 1, 'pquintanilla', '$2a$12$HASHED_PASSWORD_1', 'pat.quintanilla@duocuc.cl', 1, 1),
(2, 2, 'erobledo', '$2a$12$HASHED_PASSWORD_2', 'elisabet@email.cl', 1, 0),
(3, 3, 'dtrillo', '$2a$12$HASHED_PASSWORD_3', 'dalila@email.cl', 1, 0),
(4, 4, 'isedano', '$2a$12$HASHED_PASSWORD_4', 'isidora@email.cl', 1, 0),
(5, 5, 'smolins', '$2a$12$HASHED_PASSWORD_5', 'sigfrido@email.cl', 1, 0),
(6, 6, 'jconserje', '$2a$12$HASHED_PASSWORD_6', 'jose@conserje.cl', 1, 0),
(7, 7, 'jpiñol', '$2a$12$HASHED_PASSWORD_7', 'jordi@email.cl', 1, 0),
(8, 8, 'fadmin', '$2a$12$HASHED_PASSWORD_8', 'flora@admin.cl', 1, 0),
(9, 9, 'lalonsop', '$2a$12$HASHED_PASSWORD_9', 'lina@email.cl', 1, 0),
(10, 10, 'abarros', '$2a$12$HASHED_PASSWORD_10', 'alejandro@email.cl', 1, 0);

-- 3. ROL_SISTEMA (10 Filas)
INSERT INTO `rol_sistema` (`id`, `codigo`, `nombre`, `nivel_acceso`, `es_rol_sistema`) VALUES
(1, 'superadmin', 'Super Administrador', 100, 1),
(2, 'admin_comunidad', 'Admin Comunidad', 80, 0),
(3, 'conserje', 'Conserje', 50, 0),
(4, 'contador', 'Contador', 70, 0),
(5, 'proveedor_servicio', 'Proveedor Servicio', 30, 0),
(6, 'residente', 'Residente', 10, 0),
(7, 'propietario', 'Propietario', 20, 0),
(8, 'inquilino', 'Inquilino', 15, 0),
(9, 'tesorero', 'Tesorero', 60, 0),
(10, 'presidente_comite', 'Presidente Comité', 85, 0);

-- 4. UF_VALOR (10 Filas)
INSERT INTO `uf_valor` (`fecha`, `valor`) VALUES
('2025-10-01', 36525.1234),
('2025-10-02', 36530.4567),
('2025-10-03', 36535.7890),
('2025-10-04', 36540.1223),
('2025-10-05', 36545.4556),
('2025-10-06', 36550.7889),
('2025-10-07', 36555.1222),
('2025-10-08', 36560.4555),
('2025-10-09', 36565.7888),
('2025-10-10', 36570.1221);

-- 5. UTM_VALOR (10 Filas)
INSERT INTO `utm_valor` (`fecha`, `valor`) VALUES
('2025-10-01', 65344.17),
('2025-10-02', 68148.97),
('2025-10-03', 68736.87),
('2025-10-04', 69106.69),
('2025-10-05', 67311.87),
('2025-10-06', 66974.94),
('2025-10-07', 65985.37),
('2025-10-08', 66620.53),
('2025-10-09', 67012.59),
('2025-10-10', 60880.97);

-- *********************************************************************************
-- ETAPA 2: Entidades Comunitarias y de Configuración
-- *********************************************************************************

-- 6. COMUNIDAD (10 Filas)
INSERT INTO `comunidad` (`id`, `razon_social`, `rut`, `dv`, `direccion`, `email_contacto`, `moneda`) VALUES
(1, 'Condominio Central Providencia', '76543210', '9', 'Av. Central 1234, Providencia', 'adm@providencia.cl', 'CLP'),
(2, 'Residencial Las Condes 500', '98765432', '1', 'Calle Principal 500, Las Condes', 'admin@lascondes.cl', 'CLP'),
(3, 'Edificio Mirador Ñuñoa', '12345678', '9', 'Pasaje Los Robles 789, Ñuñoa', 'mirador@nunoa.cl', 'CLP'),
(4, 'Loteo Maipú Norte', '87654321', '0', 'Ruta Maipu 100, Maipú', 'loteo@maipu.cl', 'CLP'),
(5, 'Parque Estación Central', '23456789', 'K', 'Alameda 3000, Estación Central', 'parque@central.cl', 'CLP'),
(6, 'Condominio Vitacura Hills', '34567890', '1', 'Av. Kennedy 8000, Vitacura', 'admin@vitacura.cl', 'CLP'),
(7, 'Edificio Metro Santiago', '45678901', '2', 'Calle Bandera 500, Santiago', 'metro@stgo.cl', 'CLP'),
(8, 'Portal La Florida', '56789012', '3', 'Av. Vicuña Mackenna 9000, La Florida', 'portal@florida.cl', 'CLP'),
(9, 'Condominio Quilpué Sur', '67890123', '4', 'Calle Marga Marga 50, Quilpué', 'sur@quilpue.cl', 'CLP'),
(10, 'Loteo San Miguel', '78901234', '5', 'Av. Llano Subercaseaux 100, San Miguel', 'admin@sanmiguel.cl', 'CLP');

-- 7. EDIFICIO (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`) VALUES
(1, 1, 'Edificio Central A', 'Av. Central 1234', 'A'),
(2, 2, 'Edificio Norte B', 'Calle Principal 500', 'B'),
(3, 3, 'Edificio Único', 'Pasaje Los Robles 789', 'U'),
(4, 4, 'Zona Casas 1', 'Ruta Maipu 100', 'C1'),
(5, 5, 'Torre Alameda', 'Alameda 3000', 'TA'),
(6, 6, 'Torre Lujo', 'Av. Kennedy 8000', 'TL'),
(7, 7, 'Torre Histórica', 'Calle Bandera 500', 'TH'),
(8, 8, 'Bloque 1', 'Av. Vicuña Mackenna 9000', 'B1'),
(9, 9, 'Torre 1', 'Calle Marga Marga 50', 'T1'),
(10, 10, 'Torre El Llano', 'Av. Llano Subercaseaux 100', 'LL');

-- 8. TORRE (10 Filas - Ligado a Edificio 1-10)
INSERT INTO `torre` (`id`, `edificio_id`, `nombre`, `codigo`) VALUES
(1, 1, 'Torre 1', 'T01'),
(2, 1, 'Torre 2', 'T02'),
(3, 2, 'Torre Norte', 'TN'),
(4, 3, 'Única Torre', 'UT'),
(5, 4, 'Sector A', 'SA'),
(6, 5, 'Alameda A', 'AA'),
(7, 6, 'Luxury A', 'LA'),
(8, 7, 'Central A', 'CA'),
(9, 8, 'Bloque Principal', 'BP'),
(10, 10, 'Torre 1', 'T1');

-- 9. UNIDAD (10 Filas - Ligado a Comunidad, Edificio, Torre 1-10)
INSERT INTO `unidad` (`id`, `comunidad_id`, `edificio_id`, `torre_id`, `codigo`, `alicuota`, `m2_utiles`, `nro_estacionamiento`) VALUES
(1, 1, 1, 1, 'D101', 0.015000, 60.50, 'E101'),
(2, 1, 1, 2, 'D201', 0.020000, 75.80, 'E201'),
(3, 2, 2, 3, 'D305', 0.018000, 68.20, 'E305'),
(4, 3, 3, 4, 'D402', 0.025000, 85.00, 'E402'),
(5, 4, 4, 5, 'Casa A', 0.030000, 120.00, 'CPA'),
(6, 5, 5, 6, 'D501', 0.012000, 55.00, 'E501'),
(7, 6, 6, 7, 'D1001', 0.040000, 150.90, 'EL1'),
(8, 7, 7, 8, 'D1502', 0.022000, 78.10, 'E152'),
(9, 8, 8, 9, 'D105', 0.017000, 63.40, 'E105'),
(10, 10, 10, 10, 'D202', 0.019000, 70.30, 'E202');

-- 10. USUARIO_ROL_COMUNIDAD (10 Filas - Relaciona Usuario 1-10, Comunidad 1-10, Rol 1-10)
INSERT INTO `usuario_rol_comunidad` (`id`, `usuario_id`, `comunidad_id`, `rol_id`, `desde`, `activo`) VALUES
(1, 1, 1, 7, '2024-01-01', 1), -- P.Q. (Propietario C1)
(2, 2, 2, 8, '2024-02-15', 1), -- E.R. (Inquilino C2)
(3, 3, 3, 6, '2024-03-20', 1), -- D.T. (Residente C3)
(4, 4, 4, 7, '2024-04-10', 1), -- I.S. (Propietario C4)
(5, 5, 5, 2, '2024-05-01', 1), -- S.M. (Admin C5)
(6, 6, 6, 3, '2024-06-25', 1), -- J.A. (Conserje C6)
(7, 7, 7, 6, '2024-07-07', 1), -- J.P. (Residente C7)
(8, 8, 8, 10, '2024-08-18', 1), -- F.O. (Presidente C8)
(9, 9, 9, 4, '2024-09-01', 1), -- L.A. (Contador C9)
(10, 10, 10, 9, '2024-10-05', 1); -- A.B. (Tesorero C10)

-- 11. PARAMETROS_COBRANZA (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `parametros_cobranza` (`id`, `comunidad_id`, `dias_gracia`, `tasa_mora_mensual`, `mora_calculo`, `redondeo`, `interes_max_mensual`, `aplica_interes_sobre`) VALUES
(1, 1, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo'),
(2, 2, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital'),
(3, 3, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo'),
(4, 4, 3, 1.80, 'diaria', 'normal', 2.20, 'capital'),
(5, 5, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo'),
(6, 6, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital'),
(7, 7, 4, 1.30, 'mensual', 'normal', NULL, 'saldo'),
(8, 8, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital'),
(9, 9, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo'),
(10, 10, 11, 2.30, 'diaria', 'normal', 3.00, 'capital');

-- 12. CONFIGURACION_INTERES (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `configuracion_interes` (`id`, `comunidad_id`, `aplica_desde`, `tasa_mensual`, `metodo`, `tope_mensual`) VALUES
(1, 1, '2025-01-01', 1.20, 'simple', 2.00),
(2, 2, '2025-01-01', 1.50, 'compuesto', 2.50),
(3, 3, '2025-01-01', 1.00, 'simple', 1.80),
(4, 4, '2025-02-01', 1.10, 'compuesto', 1.90),
(5, 5, '2025-03-01', 1.30, 'simple', 2.10),
(6, 6, '2025-04-01', 1.40, 'compuesto', 2.30),
(7, 7, '2025-05-01', 1.60, 'simple', 2.60),
(8, 8, '2025-06-01', 1.15, 'compuesto', 1.95),
(9, 9, '2025-07-01', 1.25, 'simple', 2.05),
(10, 10, '2025-08-01', 1.55, 'compuesto', 2.45);

-- 13. PROVEEDOR (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `proveedor` (`id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `activo`) VALUES
(1, 1, '20123456', '7', 'Aseo Brillante Ltda.', 'Servicios de limpieza', 'aseo@brillante.cl', 1),
(2, 2, '20234567', '8', 'Tecnoseguridad SA', 'Vigilancia y alarmas', 'contacto@tecno.cl', 1),
(3, 3, '20345678', '9', 'Jardín Perfecto SpA', 'Mantención áreas verdes', 'jardin@perfecto.cl', 1),
(4, 4, '20456789', 'K', 'Plomería Rápida', 'Servicios de plomería', 'plomeria@rapida.cl', 1),
(5, 5, '20567890', '1', 'ElectriCity Chile', 'Electricidad y redes', 'electri@city.cl', 1),
(6, 6, '20678901', '2', 'Contadores Asoc.', 'Servicios de contabilidad', 'info@contadores.cl', 1),
(7, 7, '20789012', '3', 'Ascensores Up', 'Mantención de ascensores', 'soporte@ascensoresup.cl', 1),
(8, 8, '20890123', '4', 'Ferretería Maestra', 'Suministro de materiales', 'ventas@ferreteria.cl', 1),
(9, 9, '20901234', '5', 'Administración Total', 'Administración Externa', 'admin@total.cl', 1),
(10, 10, '21012345', '6', 'Servicio Técnico Gas', 'Mantención red de gas', 'gas@servicio.cl', 1);

-- *********************************************************************************
-- ETAPA 3: Entidades Operacionales y Financieras (Requieren FKs de Etapas 1 y 2)
-- *********************************************************************************

-- 14. AMENIDAD (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `amenidad` (`id`, `comunidad_id`, `nombre`, `reglas`, `capacidad`, `requiere_aprobacion`, `tarifa`) VALUES
(1, 1, 'Salón de Eventos', 'No ruidos después de las 23:00 hrs.', 50, 1, 30000.00),
(2, 2, 'Quincho Techado', 'Uso máximo 4 horas.', 15, 0, 15000.00),
(3, 3, 'Gimnasio', 'Solo mayores de 18, uso de toalla.', 20, 0, 0.00),
(4, 4, 'Piscina Exterior', 'Abierta de 10 a 20 hrs.', 40, 0, 0.00),
(5, 5, 'Sala Cowork', 'Silencio absoluto.', 10, 0, 0.00),
(6, 6, 'Sala de Cine', 'Reserva con 48 hrs.', 12, 1, 10000.00),
(7, 7, 'Lavandería', 'Máximo 2 cargas por día.', 6, 0, 2500.00),
(8, 8, 'Terraza Panorámica', 'Prohibido parrillas a carbón.', 25, 0, 0.00),
(9, 9, 'Salón de Yoga', 'Traer mat personal.', 8, 0, 0.00),
(10, 10, 'Sala de Juegos', 'Niños deben estar acompañados.', 15, 0, 0.00);

-- 15. CATEGORIA_GASTO (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `categoria_gasto` (`id`, `comunidad_id`, `nombre`, `tipo`, `cta_contable`) VALUES
(1, 1, 'Gasto Común Operacional', 'operacional', 'OP-001'),
(2, 2, 'Fondo de Reserva', 'fondo_reserva', 'FR-001'),
(3, 3, 'Gasto Extraordinario', 'extraordinario', 'EX-001'),
(4, 4, 'Multas por Reglamento', 'multas', 'MT-001'),
(5, 5, 'Consumo Agua Caliente', 'consumo', 'CO-001'),
(6, 6, 'Seguros e Impuestos', 'operacional', 'OP-002'),
(7, 7, 'Reparaciones Mayores', 'extraordinario', 'EX-002'),
(8, 8, 'Uso de Amenidades (Ingreso)', 'multas', 'MT-002'), -- Usado como ingreso/ajuste en cargos
(9, 9, 'Gasto de Administración', 'operacional', 'OP-003'),
(10, 10, 'Consumo Electricidad Común', 'consumo', 'CO-002');

-- 16. CENTRO_COSTO (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `centro_costo` (`id`, `comunidad_id`, `nombre`, `codigo`) VALUES
(1, 1, 'Aseo y Limpieza', 'CC001'),
(2, 2, 'Seguridad 24H', 'CC002'),
(3, 3, 'Mantención General', 'CC003'),
(4, 4, 'Áreas Verdes', 'CC004'),
(5, 5, 'Suministros', 'CC005'),
(6, 6, 'Gastos Fijos', 'CC006'),
(7, 7, 'Ascensores y Escaleras', 'CC007'),
(8, 8, 'Zonas Comunes', 'CC008'),
(9, 9, 'Honorarios', 'CC009'),
(10, 10, 'Contabilidad', 'CC010');

-- 17. DOCUMENTO_COMPRA (10 Filas - Ligado a Comunidad 1-10, Proveedor 1-10)
INSERT INTO `documento_compra` (`id`, `comunidad_id`, `proveedor_id`, `tipo_doc`, `folio`, `fecha_emision`, `neto`, `iva`, `total`, `glosa`) VALUES
(1, 1, 1, 'factura', 'F-1001', '2025-09-01', 100000.00, 19000.00, 119000.00, 'Servicio de Aseo Septiembre'),
(2, 2, 2, 'boleta', 'B-2005', '2025-09-02', 50000.00, 9500.00, 59500.00, 'Compra de cámara de repuesto'),
(3, 3, 3, 'factura', 'F-3010', '2025-09-03', 75000.00, 14250.00, 89250.00, 'Mantención Jardines Trimestral'),
(4, 4, 4, 'boleta', 'B-4001', '2025-09-04', 30000.00, 5700.00, 35700.00, 'Reparación de válvula principal'),
(5, 5, 5, 'factura', 'F-5015', '2025-09-05', 90000.00, 17100.00, 107100.00, 'Reparación de luminaria exterior'),
(6, 6, 6, 'factura', 'F-6002', '2025-09-06', 120000.00, 22800.00, 142800.00, 'Honorarios Contables Septiembre'),
(7, 7, 7, 'factura', 'F-7007', '2025-09-07', 80000.00, 15200.00, 95200.00, 'Mantención Ascensores'),
(8, 8, 8, 'boleta', 'B-8003', '2025-09-08', 40000.00, 7600.00, 47600.00, 'Compra de pintura para pasillos'),
(9, 9, 9, 'factura', 'F-9011', '2025-09-09', 150000.00, 28500.00, 178500.00, 'Fee Administración Septiembre'),
(10, 10, 10, 'boleta', 'B-1002', '2025-09-10', 60000.00, 11400.00, 71400.00, 'Revisión técnica de red de gas');

-- 18. GASTO (10 Filas - Ligado a Comunidad 1-10, Categoria 1-10, Centro Costo 1-10, Doc Compra 1-10)
INSERT INTO `gasto` (`id`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `glosa`, `extraordinario`) VALUES
(1, 1, 1, 1, 1, '2025-09-01', 119000.00, 'Gasto Aseo Comunal', 0),
(2, 2, 2, 2, 2, '2025-09-02', 59500.00, 'Aporte a Fondo de Reserva', 0),
(3, 3, 3, 3, 3, '2025-09-03', 89250.00, 'Gasto Extraordinario Jardinería', 1),
(4, 4, 4, 4, 4, '2025-09-04', 35700.00, 'Gasto Multa (no aplica a unidad)', 0),
(5, 5, 5, 5, 5, '2025-09-05', 107100.00, 'Consumo Común de Agua Caliente', 0),
(6, 6, 6, 6, 6, '2025-09-06', 142800.00, 'Gasto Fijo Contabilidad', 0),
(7, 7, 7, 7, 7, '2025-09-07', 95200.00, 'Reparación de Motor de Ascensor', 1),
(8, 8, 8, 8, 8, '2025-09-08', 47600.00, 'Compra de Materiales de Mantención', 0),
(9, 9, 9, 9, 9, '2025-09-09', 178500.00, 'Gasto de Administración', 0),
(10, 10, 10, 10, 10, '2025-09-10', 71400.00, 'Consumo Electricidad Común', 0);

-- 19. EMISION_GASTOS_COMUNES (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `emision_gastos_comunes` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`) VALUES
(1, 1, '2025-09', '2025-10-05', 'emitido', 'Emisión Septiembre C1'),
(2, 2, '2025-09', '2025-10-06', 'emitido', 'Emisión Septiembre C2'),
(3, 3, '2025-09', '2025-10-07', 'cerrado', 'Emisión Septiembre C3'),
(4, 4, '2025-09', '2025-10-08', 'emitido', 'Emisión Septiembre C4'),
(5, 5, '2025-09', '2025-10-09', 'emitido', 'Emisión Septiembre C5'),
(6, 6, '2025-09', '2025-10-10', 'borrador', 'Emisión Septiembre C6'),
(7, 7, '2025-09', '2025-10-11', 'emitido', 'Emisión Septiembre C7'),
(8, 8, '2025-09', '2025-10-12', 'emitido', 'Emisión Septiembre C8'),
(9, 9, '2025-09', '2025-10-13', 'cerrado', 'Emisión Septiembre C9'),
(10, 10, '2025-09', '2025-10-14', 'emitido', 'Emisión Septiembre C10');

-- 20. DETALLE_EMISION_GASTOS (10 Filas - Ligado a Emision 1-10, Gasto 1-10, Categoria 1-10)
INSERT INTO `detalle_emision_gastos` (`id`, `emision_id`, `gasto_id`, `categoria_id`, `monto`, `regla_prorrateo`) VALUES
(1, 1, 1, 1, 119000.00, 'coeficiente'),
(2, 2, 2, 2, 59500.00, 'partes_iguales'),
(3, 3, 3, 3, 89250.00, 'coeficiente'),
(4, 4, 4, 4, 35700.00, 'fijo_por_unidad'),
(5, 5, 5, 5, 107100.00, 'consumo'),
(6, 6, 6, 6, 142800.00, 'coeficiente'),
(7, 7, 7, 7, 95200.00, 'partes_iguales'),
(8, 8, 8, 8, 47600.00, 'fijo_por_unidad'),
(9, 9, 9, 9, 178500.00, 'coeficiente'),
(10, 10, 10, 10, 71400.00, 'consumo');

-- 21. TITULARES_UNIDAD (10 Filas - Ligado a Comunidad 1-10, Unidad 1-10, Persona 1-10)
INSERT INTO `titulares_unidad` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo`, `desde`, `porcentaje`) VALUES
(1, 1, 1, 1, 'propietario', '2024-01-01', 100.00),
(2, 1, 2, 2, 'arrendatario', '2024-02-01', 100.00),
(3, 2, 3, 3, 'propietario', '2024-03-01', 100.00),
(4, 3, 4, 4, 'arrendatario', '2024-04-01', 100.00),
(5, 4, 5, 5, 'propietario', '2024-05-01', 100.00),
(6, 5, 6, 6, 'arrendatario', '2024-06-01', 100.00),
(7, 6, 7, 7, 'propietario', '2024-07-01', 100.00),
(8, 7, 8, 8, 'arrendatario', '2024-08-01', 100.00),
(9, 8, 9, 9, 'propietario', '2024-09-01', 100.00),
(10, 9, 9, 10, 'arrendatario', '2024-10-01', 100.00);

-- 22. MEDIDOR (10 Filas - Ligado a Comunidad 1-10, Unidad 1-10)
INSERT INTO `medidor` (`id`, `comunidad_id`, `unidad_id`, `tipo`, `codigo`, `es_compartido`) VALUES
(1, 1, 1, 'agua', 'AGUA-101', 0),
(2, 1, 2, 'electricidad', 'ELEC-201', 0),
(3, 2, 3, 'gas', 'GAS-305', 0),
(4, 3, 4, 'agua', 'AGUA-402', 0),
(5, 4, 5, 'electricidad', 'ELEC-CASA-A', 0),
(6, 5, 6, 'gas', 'GAS-501', 0),
(7, 6, 7, 'agua', 'AGUA-1001', 0),
(8, 7, 8, 'electricidad', 'ELEC-1502', 0),
(9, 8, 9, 'gas', 'GAS-105', 0),
(10, 9, 9, 'agua', 'AGUA-105-C9', 0); -- Unidad 9 tiene 2 medidores para diferentes servicios

-- 23. TARIFA_CONSUMO (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `tarifa_consumo` (`id`, `comunidad_id`, `tipo`, `periodo_desde`, `precio_por_unidad`, `cargo_fijo`) VALUES
(1, 1, 'agua', '2025-09', 0.650000, 1800.00),
(2, 2, 'gas', '2025-09', 1.200000, 2200.00),
(3, 3, 'electricidad', '2025-09', 0.950000, 2500.00),
(4, 4, 'agua', '2025-09', 0.700000, 1900.00),
(5, 5, 'gas', '2025-09', 1.300000, 2000.00),
(6, 6, 'electricidad', '2025-09', 1.000000, 2600.00),
(7, 7, 'agua', '2025-09', 0.600000, 1700.00),
(8, 8, 'gas', '2025-09', 1.250000, 2100.00),
(9, 9, 'electricidad', '2025-09', 0.900000, 2400.00),
(10, 10, 'agua', '2025-09', 0.680000, 1850.00);

-- *********************************************************************************
-- ETAPA 4: Transacciones y Logs (Usan FKs de todas las etapas)
-- *********************************************************************************

-- 24. LECTURA_MEDIDOR (10 Filas - Ligado a Medidor 1-10)
INSERT INTO `lectura_medidor` (`id`, `medidor_id`, `fecha`, `lectura`, `periodo`) VALUES
(1, 1, '2025-09-30', 50.500, '2025-09'),
(2, 2, '2025-09-30', 120.300, '2025-09'),
(3, 3, '2025-09-30', 90.100, '2025-09'),
(4, 4, '2025-09-30', 65.800, '2025-09'),
(5, 5, '2025-09-30', 150.000, '2025-09'),
(6, 6, '2025-09-30', 88.700, '2025-09'),
(7, 7, '2025-09-30', 105.200, '2025-09'),
(8, 8, '2025-09-30', 130.400, '2025-09'),
(9, 9, '2025-09-30', 75.600, '2025-09'),
(10, 10, '2025-09-30', 44.900, '2025-09');

-- 25. CUENTA_COBRO_UNIDAD (10 Filas - Ligado a Emision 1-10, Comunidad 1-10, Unidad 1-10)
INSERT INTO `cuenta_cobro_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`) VALUES
(1, 1, 1, 1, 45000.00, 45000.00, 'pendiente', 0.00),
(2, 2, 2, 3, 62000.00, 0.00, 'pagado', 0.00),
(3, 3, 3, 4, 88000.00, 88000.00, 'vencido', 1500.00),
(4, 4, 4, 5, 51000.00, 20000.00, 'parcial', 0.00),
(5, 5, 5, 6, 73000.00, 73000.00, 'pendiente', 0.00),
(6, 6, 6, 7, 95000.00, 95000.00, 'pendiente', 0.00), -- CORREGIDO: 'borrador' cambiado a 'pendiente'
(7, 7, 7, 8, 55000.00, 0.00, 'pagado', 0.00),
(8, 8, 8, 9, 78000.00, 30000.00, 'parcial', 500.00),
(9, 9, 9, 10, 49000.00, 49000.00, 'vencido', 800.00),
(10, 10, 10, 10, 68000.00, 0.00, 'pagado', 0.00);

-- 26. PAGO (10 Filas - Ligado a Comunidad 1-10, Unidad 1-10, Persona 1-10)
INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`) VALUES
(1, 2, 3, 3, '2025-10-01', 62000.00, 'transferencia', 'REF-P001', 'aplicado'),
(2, 4, 5, 5, '2025-10-02', 31000.00, 'webpay', 'REF-P002', 'aplicado'),
(3, 7, 8, 8, '2025-10-03', 55000.00, 'efectivo', 'REF-P003', 'aplicado'),
(4, 8, 9, 9, '2025-10-04', 48000.00, 'transferencia', 'REF-P004', 'aplicado'),
(5, 10, 10, 10, '2025-10-05', 68000.00, 'webpay', 'REF-P005', 'aplicado'),
(6, 1, 1, 1, '2025-10-06', 45000.00, 'efectivo', 'REF-P006', 'pendiente'),
(7, 3, 4, 4, '2025-10-07', 88000.00, 'transferencia', 'REF-P007', 'pendiente'),
(8, 5, 6, 6, '2025-10-08', 73000.00, 'webpay', 'REF-P008', 'pendiente'),
(9, 9, 10, 10, '2025-10-09', 49000.00, 'efectivo', 'REF-P009', 'pendiente'),
(10, 6, 7, 7, '2025-10-10', 95000.00, 'transferencia', 'REF-P010', 'pendiente');

-- 27. PAGO_APLICACION (10 Filas - Ligado a Pago 1-10, Cuenta Cobro Unidad 1-10)
INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cuenta_cobro_unidad_id`, `monto`, `prioridad`) VALUES
(1, 1, 2, 62000.00, 1),
(2, 2, 4, 31000.00, 1),
(3, 3, 7, 55000.00, 1),
(4, 4, 8, 48000.00, 1),
(5, 5, 10, 68000.00, 1),
(6, 6, 1, 45000.00, 1),
(7, 7, 3, 88000.00, 1),
(8, 8, 5, 73000.00, 1),
(9, 9, 9, 49000.00, 1),
(10, 10, 6, 95000.00, 1);

-- 28. DETALLE_CUENTA_UNIDAD (10 Filas - Ligado a Cuenta Cobro Unidad 1-10, Categoria 1-10)
INSERT INTO `detalle_cuenta_unidad` (`id`, `cuenta_cobro_unidad_id`, `categoria_id`, `glosa`, `monto`, `origen`, `iva_incluido`) VALUES
(1, 1, 1, 'Gasto Base Operacional', 45000.00, 'gasto', 1),
(2, 2, 2, 'Aporte Fondo Reserva', 62000.00, 'gasto', 1),
(3, 3, 3, 'Cuota por Gasto Extraordinario', 88000.00, 'ajuste', 1),
(4, 4, 4, 'Multa por Atraso', 10000.00, 'multa', 0),
(5, 4, 5, 'Consumo Agua Caliente', 41000.00, 'consumo', 1),
(6, 5, 6, 'Gastos Fijos y Seguros', 73000.00, 'gasto', 1),
(7, 6, 7, 'Cuota por Reparación Ascensores', 95000.00, 'ajuste', 1),
(8, 7, 8, 'Recargo uso Amenidades', 55000.00, 'multa', 0),
(9, 8, 9, 'Gasto de Administración', 78000.00, 'gasto', 1),
(10, 9, 10, 'Consumo Electricidad', 49000.00, 'consumo', 1);

-- 29. MULTA (10 Filas - Ligado a Comunidad 1-10, Unidad 1-10, Persona 1-10)
INSERT INTO `multa` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `monto`, `estado`, `fecha`) VALUES
(1, 1, 1, 1, 'Mascota sin correa', 5000.00, 'pendiente', '2025-09-01'),
(2, 2, 3, 3, 'Ruido excesivo', 15000.00, 'pagada', '2025-09-02'),
(3, 3, 4, 4, 'Bloqueo de acceso', 10000.00, 'pendiente', '2025-09-03'),
(4, 4, 5, 5, 'Fumar en áreas comunes', 20000.00, 'anulada', '2025-09-04'),
(5, 5, 6, 6, 'Daño a propiedad común', 30000.00, 'pendiente', '2025-09-05'),
(6, 6, 7, 7, 'Mascota peligrosa sin bozal', 12000.00, 'pagada', '2025-09-06'),
(7, 7, 8, 8, 'Uso no autorizado de ascensor', 8000.00, 'pendiente', '2025-09-07'),
(8, 8, 9, 9, 'Dejar basura en pasillo', 6000.00, 'pagada', '2025-09-08'),
(9, 9, 10, 10, 'Instalación de antena sin permiso', 25000.00, 'pendiente', '2025-09-09'),
(10, 10, 10, 10, 'Fiesta hasta tarde', 18000.00, 'pagada', '2025-09-10');

-- 30. RESERVA_AMENIDAD (10 Filas - Ligado a Comunidad 1-10, Amenidad 1-10, Unidad 1-10, Persona 1-10)
INSERT INTO `reserva_amenidad` (`id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio`, `fin`, `estado`) VALUES
(1, 1, 1, 1, 1, '2025-10-15 19:00:00', '2025-10-15 22:00:00', 'aprobada'),
(2, 2, 2, 3, 3, '2025-10-16 12:00:00', '2025-10-16 16:00:00', 'solicitada'),
(3, 3, 3, 4, 4, '2025-10-17 07:00:00', '2025-10-17 08:00:00', 'cumplida'),
(4, 4, 4, 5, 5, '2025-10-18 14:00:00', '2025-10-18 18:00:00', 'rechazada'),
(5, 5, 5, 6, 6, '2025-10-19 09:00:00', '2025-10-19 13:00:00', 'aprobada'),
(6, 6, 6, 7, 7, '2025-10-20 20:00:00', '2025-10-20 23:00:00', 'solicitada'),
(7, 7, 7, 8, 8, '2025-10-21 10:00:00', '2025-10-21 12:00:00', 'aprobada'),
(8, 8, 8, 9, 9, '2025-10-22 17:00:00', '2025-10-22 21:00:00', 'cumplida'),
(9, 9, 9, 10, 10, '2025-10-23 11:00:00', '2025-10-23 12:30:00', 'cancelada'),
(10, 10, 10, 10, 10, '2025-10-24 16:00:00', '2025-10-24 18:00:00', 'aprobada');

-- 31. DOCUMENTO_COMUNIDAD (10 Filas - Ligado a Comunidad 1-10)
INSERT INTO `documento_comunidad` (`id`, `comunidad_id`, `tipo`, `titulo`, `url`, `periodo`, `visibilidad`) VALUES
(1, 1, 'circular', 'Aviso corte de agua', 'https://docs.cc/c1/circular-agua.pdf', '2025-10', 'publico'),
(2, 2, 'acta', 'Acta Asamblea Anual 2024', 'https://docs.cc/c2/acta-2024.pdf', '2024-12', 'privado'),
(3, 3, 'reglamento', 'Reglamento de Copropiedad', 'https://docs.cc/c3/reglamento.pdf', NULL, 'publico'),
(4, 4, 'boletin', 'Boletín N°10 Octubre', 'https://docs.cc/c4/boletin-10.pdf', '2025-10', 'publico'),
(5, 5, 'otro', 'Informe Técnico Ascensores', 'https://docs.cc/c5/informe-asc.pdf', '2025-09', 'privado'),
(6, 6, 'circular', 'Cambio en Horario de Piscina', 'https://docs.cc/c6/circ-piscina.pdf', '2025-10', 'publico'),
(7, 7, 'acta', 'Acta Reunión Comité', 'https://docs.cc/c7/acta-comite-10.pdf', '2025-10', 'privado'),
(8, 8, 'reglamento', 'Uso de Estacionamientos', 'https://docs.cc/c8/regl-estac.pdf', NULL, 'publico'),
(9, 9, 'boletin', 'Resumen Gastos Q3', 'https://docs.cc/c9/resumen-q3.pdf', '2025-09', 'privado'),
(10, 10, 'otro', 'Certificado Recepción Final', 'https://docs.cc/c10/cert-final.pdf', NULL, 'privado');

-- 32. CONCILIACION_BANCARIA (10 Filas - Ligado a Comunidad 1-10, Pago 1-10)
INSERT INTO `conciliacion_bancaria` (`id`, `comunidad_id`, `fecha_mov`, `monto`, `glosa`, `referencia`, `estado`, `pago_id`) VALUES
(1, 2, '2025-10-01', 62000.00, 'Trf 62000 U305', 'TRF-ABC1', 'conciliado', 1),
(2, 4, '2025-10-02', 31000.00, 'Webpay Pago Casa A', 'WP-XYZ2', 'conciliado', 2),
(3, 7, '2025-10-03', 55000.00, 'Depósito efectivo D1502', 'EFE-1233', 'conciliado', 3),
(4, 8, '2025-10-04', 48000.00, 'Transferencia U105', 'TRF-LMN4', 'conciliado', 4),
(5, 10, '2025-10-05', 68000.00, 'Webpay D202', 'WP-QRS5', 'conciliado', 5),
(6, 1, '2025-10-06', 45000.00, 'Transferencia sin identificar', 'TRF-IND6', 'pendiente', 6),
(7, 3, '2025-10-07', 88000.00, 'Pago D402', 'TRF-TUV7', 'pendiente', 7),
(8, 5, '2025-10-08', 73000.00, 'Pago Pendiente D501', 'WP-UVW8', 'pendiente', 8),
(9, 9, '2025-10-09', 49000.00, 'Depósito UQ01', 'EFE-XYZ9', 'pendiente', 9),
(10, 6, '2025-10-10', 95000.00, 'Pago Pendiente D1001', 'TRF-JKL10', 'pendiente', 10);

-- 33. REGISTRO_CONSERJERIA (10 Filas - Ligado a Comunidad 1-10, Usuario 1-10)
INSERT INTO `registro_conserjeria` (`id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`) VALUES
(1, 1, '2025-10-01 08:30:00', 6, 'entrega', 'Paquete grande recibido para D101.'),
(2, 2, '2025-10-01 15:45:00', 6, 'visita', 'Ingreso de técnico de ascensores.'),
(3, 3, '2025-10-02 10:00:00', 6, 'reporte', 'Fuga de agua menor reportada en piso 1.'),
(4, 4, '2025-10-02 19:20:00', 6, 'retiro', 'Unidad Casa A retira llave de piscina.'),
(5, 5, '2025-10-03 07:00:00', 6, 'otro', 'Cambio de turno de seguridad B.'),
(6, 6, '2025-10-03 13:30:00', 6, 'visita', 'Visita de contratista para Torre Lujo.'),
(7, 7, '2025-10-04 11:00:00', 6, 'reporte', 'Alarma de incendio activada por error.'),
(8, 8, '2025-10-04 18:40:00', 6, 'entrega', 'Correspondencia certificada para D105.'),
(9, 9, '2025-10-05 05:00:00', 6, 'otro', 'Prueba de grupo electrógeno OK.'),
(10, 10, '2025-10-05 17:15:00', 6, 'visita', 'Amigo visita a residente de D202.');

-- 34. TICKET_SOPORTE (10 Filas - Ligado a Comunidad 1-10, Unidad 1-10, Usuario 1-10)
INSERT INTO `ticket_soporte` (`id`, `comunidad_id`, `unidad_id`, `categoria`, `titulo`, `descripcion`, `estado`, `prioridad`, `asignado_a`) VALUES
(1, 1, 1, 'Electricidad', 'Problema con medidor', 'Medidor no marca correctamente.', 'abierto', 'alta', 8),
(2, 2, 3, 'Limpieza', 'Basura en pasillo', 'Basura acumulada cerca del ducto.', 'en_progreso', 'media', 6),
(3, 3, 4, 'Ascensor', 'Ascensor detenido', 'Ascensor principal no funciona.', 'cerrado', 'alta', 7),
(4, 4, 5, 'Jardinería', 'Árbol seco', 'Árbol frontal necesita ser retirado.', 'abierto', 'baja', NULL),
(5, 5, 6, 'Seguridad', 'Cámara apagada', 'Cámara de seguridad N°5 no enciende.', 'en_progreso', 'alta', 2),
(6, 6, 7, 'Mantención', 'Filtración en techo', 'Mancha de humedad en techo de unidad D1001.', 'resuelto', 'media', 1),
(7, 7, 8, 'Iluminación', 'Foco quemado', 'Foco quemado en pasillo piso 15.', 'cerrado', 'media', 5),
(8, 8, 9, 'Infraestructura', 'Grieta en muro exterior', 'Grieta visible en bloque 1.', 'abierto', 'alta', NULL),
(9, 9, 10, 'Ascensor', 'Ruidos extraños', 'Ascensor hace ruidos al frenar.', 'en_progreso', 'alta', 3),
(10, 10, 10, 'Electricidad', 'Cortocircuito', 'Olor a quemado cerca de la sala eléctrica.', 'cerrado', 'alta', 4);

-- 35. NOTIFICACION_USUARIO (10 Filas - Ligado a Comunidad 1-10, Persona 1-10)
INSERT INTO `notificacion_usuario` (`id`, `comunidad_id`, `persona_id`, `tipo`, `titulo`, `mensaje`, `leida`, `objeto_tipo`, `objeto_id`) VALUES
(1, 1, 1, 'alerta', 'Pago Vencido', 'Su gasto común de septiembre está vencido.', 0, 'cuenta_cobro_unidad', 1),
(2, 2, 3, 'info', 'Pago Aplicado', 'Su pago ha sido aplicado con éxito.', 1, 'pago', 1),
(3, 3, 4, 'recordatorio', 'Próxima Votación', 'Vote por el presupuesto del próximo año.', 0, 'documento_comunidad', 7),
(4, 4, 5, 'info', 'Reserva Aprobada', 'Su solicitud de piscina para el 2025-10-25 ha sido aprobada.', 1, 'reserva_amenidad', 5),
(5, 5, 6, 'alerta', 'Ticket Asignado', 'Se le asignó el ticket N°5 de seguridad.', 0, 'ticket_soporte', 5),
(6, 6, 7, 'recordatorio', 'Mantención General', 'Recordatorio de la mantención del ascensor mañana.', 0, 'registro_conserjeria', 6),
(7, 7, 8, 'info', 'Nueva Multa', 'Se ha generado una multa a su unidad.', 0, 'multa', 7),
(8, 8, 9, 'alerta', 'Saldo Pendiente', 'Su saldo parcial tiene intereses acumulados.', 0, 'cuenta_cobro_unidad', 8),
(9, 9, 10, 'recordatorio', 'Entrega de Paquete', 'Tiene un paquete pendiente de retiro en conserjería.', 1, 'registro_conserjeria', 9),
(10, 10, 10, 'info', 'Cierre de Emisión', 'El periodo de gasto común 2025-09 ha sido cerrado.', 1, 'emision_gastos_comunes', 10);

-- 36. SESION_USUARIO (10 Filas - Ligado a Usuario 1-10)
INSERT INTO `sesion_usuario` (`id`, `usuario_id`, `ip_address`, `user_agent`, `last_activity`) VALUES
('SES-01', 1, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0)', '2025-10-10 17:00:00'),
('SES-02', 2, '192.168.1.2', 'Mozilla/5.0 (Macintosh)', '2025-10-10 16:30:00'),
('SES-03', 3, '192.168.1.3', 'Mozilla/5.0 (iPhone)', '2025-10-10 15:50:00'),
('SES-04', 4, '192.168.1.4', 'Mozilla/5.0 (Android)', '2025-10-09 10:00:00'),
('SES-05', 5, '192.168.1.5', 'Mozilla/5.0 (Linux)', '2025-10-10 14:15:00'),
('SES-06', 6, '192.168.1.6', 'Mozilla/5.0 (iPad)', '2025-10-10 13:45:00'),
('SES-07', 7, '192.168.1.7', 'Mozilla/5.0 (Tablet)', '2025-10-08 11:20:00'),
('SES-08', 8, '192.168.1.8', 'Mozilla/5.0 (Smart TV)', '2025-10-10 12:05:00'),
('SES-09', 9, '192.168.1.9', 'Mozilla/5.0 (Windows NT 6.1)', '2025-10-10 11:30:00'),
('SES-10', 10, '192.168.1.10', 'Mozilla/5.0 (Windows NT 5.1)', '2025-10-10 10:00:00');

-- 37. USER_PREFERENCES (10 Filas - Ligado a Usuario 1-10)
INSERT INTO `user_preferences` (`id`, `user_id`, `preferences`) VALUES
(1, 1, '{"tema": "oscuro", "idioma": "es", "notificaciones": "on"}'),
(2, 2, '{"tema": "claro", "idioma": "es", "notificaciones": "off"}'),
(3, 3, '{"tema": "claro", "idioma": "en", "notificaciones": "on"}'),
(4, 4, '{"tema": "oscuro", "idioma": "es", "notificaciones": "on"}'),
(5, 5, '{"tema": "claro", "idioma": "en", "notificaciones": "on"}'),
(6, 6, '{"tema": "oscuro", "idioma": "es", "notificaciones": "on"}'),
(7, 7, '{"tema": "claro", "idioma": "es", "notificaciones": "off"}'),
(8, 8, '{"tema": "oscuro", "idioma": "en", "notificaciones": "on"}'),
(9, 9, '{"tema": "claro", "idioma": "es", "notificaciones": "on"}'),
(10, 10, '{"tema": "oscuro", "idioma": "es", "notificaciones": "off"}');

-- 38. ARCHIVOS (10 Filas - Ligado a Comunidad 1-10, Usuario 1-10)
INSERT INTO `archivos` (`id`, `original_name`, `filename`, `file_path`, `file_size`, `mimetype`, `comunidad_id`, `entity_type`, `entity_id`, `uploaded_by`) VALUES
(1, 'Reporte_Gas_C2.pdf', 'rep_gas_c2.pdf', '/docs/c2/rep_gas_c2.pdf', 500000, 'application/pdf', 2, 'documento_compra', 10, 5),
(2, 'Foto_Grieta.jpg', 'foto_grieta_c8.jpg', '/tickets/c8/foto_grieta.jpg', 1200000, 'image/jpeg', 8, 'ticket_soporte', 8, 8),
(3, 'Comprobante_Pago_4.png', 'comp_pago_4.png', '/pagos/c8/comp_pago_4.png', 300000, 'image/png', 8, 'pago', 4, 9),
(4, 'Acta_Comite_C7.pdf', 'acta_com_c7.pdf', '/docs/c7/acta_com_c7.pdf', 800000, 'application/pdf', 7, 'documento_comunidad', 7, 7),
(5, 'Lectura_105_09.csv', 'lectura_105_09.csv', '/lecturas/c5/lectura_105_09.csv', 10000, 'text/csv', 5, 'lectura_medidor', 6, 5),
(6, 'Factura_Aseo_C1.pdf', 'fact_aseo_c1.pdf', '/docs/c1/fact_aseo_c1.pdf', 600000, 'application/pdf', 1, 'documento_compra', 1, 1),
(7, 'Foto_Ascensor_C3.jpg', 'foto_asc_c3.jpg', '/tickets/c3/foto_asc_c3.jpg', 900000, 'image/jpeg', 3, 'ticket_soporte', 3, 3),
(8, 'Comp_Webpay_C4.pdf', 'comp_wp_c4.pdf', '/pagos/c4/comp_wp_c4.pdf', 250000, 'application/pdf', 4, 'pago', 2, 4),
(9, 'Reglamento_Mascotas.pdf', 'regl_mascotas_c6.pdf', '/docs/c6/regl_mascotas_c6.pdf', 700000, 'application/pdf', 6, 'documento_comunidad', 6, 6),
(10, 'Multa_Ruido_C2.pdf', 'multa_ruido_c2.pdf', '/multas/c2/multa_ruido_c2.pdf', 150000, 'application/pdf', 2, 'multa', 2, 3);

-- 39. WEBHOOK_PAGO (10 Filas - Ligado a Comunidad 1-10, Pago 1-10)
INSERT INTO `webhook_pago` (`id`, `comunidad_id`, `proveedor`, `payload_json`, `procesado`, `pago_id`) VALUES
(1, 2, 'transferencia', '{"tx_id": "tr1", "monto": 62000}', 1, 1),
(2, 4, 'webpay', '{"tx_id": "wp2", "monto": 31000}', 1, 2),
(3, 7, 'otro', '{"detalle": "efectivo 55000"}', 1, 3),
(4, 8, 'transferencia', '{"tx_id": "tr4", "monto": 48000}', 1, 4),
(5, 10, 'webpay', '{"tx_id": "wp5", "monto": 68000}', 1, 5),
(6, 1, 'transferencia', '{"tx_id": "tr6", "monto": 45000}', 0, NULL),
(7, 3, 'transferencia', '{"tx_id": "tr7", "monto": 88000}', 0, NULL),
(8, 5, 'webpay', '{"tx_id": "wp8", "monto": 73000}', 0, NULL),
(9, 9, 'otro', '{"detalle": "efectivo 49000"}', 0, NULL),
(10, 6, 'transferencia', '{"tx_id": "tr10", "monto": 95000}', 0, NULL);

-- 40. AUDITORIA (10 Filas - Ligado a Usuario 1-10)
INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`) VALUES
(1, 1, 'UPDATE', 'unidad', 1, '{"alicuota": "0.010000"}', '{"alicuota": "0.015000"}', '192.168.1.1'),
(2, 2, 'INSERT', 'pago', 1, NULL, '{"monto": 62000, "medio": "transferencia"}', '192.168.1.2'),
(3, 3, 'UPDATE', 'multa', 2, '{"estado": "pendiente"}', '{"estado": "pagada"}', '192.168.1.3'),
(4, 4, 'INSERT', 'ticket_soporte', 4, NULL, '{"titulo": "Árbol seco"}', '192.168.1.4'),
(5, 5, 'UPDATE', 'emision_gastos_comunes', 5, '{"estado": "borrador"}', '{"estado": "emitido"}', '192.168.1.5'),
(6, 6, 'INSERT', 'registro_conserjeria', 6, NULL, '{"evento": "visita"}', '192.168.1.6'),
(7, 7, 'UPDATE', 'unidad', 8, '{"nro_estacionamiento": "E105A"}', '{"nro_estacionamiento": "E152"}', '192.168.1.7'),
(8, 8, 'INSERT', 'gasto', 8, NULL, '{"monto": 47600}', '192.168.1.8'),
(9, 9, 'UPDATE', 'cuenta_cobro_unidad', 9, '{"saldo": "49000.00"}', '{"estado": "vencido"}', '192.168.1.9'),
(10, 10, 'INSERT', 'lectura_medidor', 10, NULL, '{"lectura": 44.900}', '192.168.1.10');
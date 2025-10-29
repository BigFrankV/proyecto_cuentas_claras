-- Inserts para la tabla 'emision_gastos_comunes' (IDs desde 65) - Necesarios para 'cuenta_cobro_unidad'
INSERT INTO `emision_gastos_comunes` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`) VALUES
(65, 36, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C36'),
(66, 46, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C46'),
(67, 49, '2025-10', '2025-11-10', 'cerrado', 'Emisión Octubre C49'),
(68, 40, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C40'),
(69, 41, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C41'),
(70, 59, '2025-10', '2025-11-10', 'cerrado', 'Emisión Octubre C59'),
(71, 32, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C32'),
(72, 36, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C36'),
(73, 46, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C46'),
(74, 49, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C49'),
(75, 40, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C40'),
(76, 41, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C41'),
(77, 59, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C59'),
(78, 32, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C32'),
(79, 36, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C36'),
(80, 46, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C46'),
(81, 49, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C49'),
(82, 40, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C40'),
(83, 41, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C41'),
(84, 59, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C59');

-- Inserts para la tabla 'cuenta_cobro_unidad' (IDs desde 101) - Usando nuevas emisiones
INSERT INTO `cuenta_cobro_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`) VALUES
(101, 65, 36, 36, 98000.00, 98000.00, 'pendiente', 0.00), -- Oct C36 U36
(102, 66, 46, 46, 42000.00, 0.00, 'pagado', 0.00), -- Oct C46 U46
(103, 67, 49, 49, 50000.00, 50000.00, 'vencido', 750.00), -- Oct C49 U49 (Cerrado y vencido)
(104, 68, 40, 40, 75000.00, 75000.00, 'pendiente', 0.00), -- Oct C40 U40
(105, 69, 41, 41, 60000.00, 10000.00, 'parcial', 0.00), -- Oct C41 U41
(106, 70, 59, 59, 85000.00, 85000.00, 'vencido', 1275.00), -- Oct C59 U59 (Cerrado y vencido)
(107, 71, 32, 32, 47000.00, 0.00, 'pagado', 0.00), -- Oct C32 U32
(108, 72, 36, 36, 99500.00, 99500.00, 'pendiente', 0.00), -- Nov C36 U36
(109, 73, 46, 46, 43500.00, 43500.00, 'pendiente', 0.00), -- Nov C46 U46
(110, 74, 49, 49, 51500.00, 51500.00, 'pendiente', 0.00), -- Nov C49 U49
(111, 75, 40, 40, 76500.00, 76500.00, 'pendiente', 0.00), -- Nov C40 U40
(112, 76, 41, 41, 61500.00, 61500.00, 'pendiente', 0.00), -- Nov C41 U41
(113, 77, 59, 59, 86500.00, 86500.00, 'pendiente', 0.00), -- Nov C59 U59
(114, 78, 32, 32, 48500.00, 48500.00, 'pendiente', 0.00), -- Nov C32 U32
(115, 65, 36, 76, 65000.00, 65000.00, 'pendiente', 0.00), -- Oct C36 U76
(116, 66, 46, 91, 40000.00, 0.00, 'pagado', 0.00), -- Oct C46 U91
(117, 67, 49, 97, 55000.00, 55000.00, 'vencido', 825.00), -- Oct C49 U97
(118, 68, 40, 80, 78000.00, 78000.00, 'pendiente', 0.00), -- Oct C40 U80
(119, 69, 41, 81, 62000.00, 2000.00, 'parcial', 0.00), -- Oct C41 U81
(120, 70, 59, 117, 88000.00, 88000.00, 'vencido', 1320.00); -- Oct C59 U117

-- Inserts para la tabla 'pago' (IDs desde 121)
INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`) VALUES
(121, 36, 36, 36, '2025-11-20', 98000.00, 'transferencia', 'REF-P161', 'aplicado'), -- Paga Oct C36 U36
(122, 46, 46, 46, '2025-10-25', 42000.00, 'webpay', 'REF-P162', 'aplicado'), -- Paga Oct C46 U46
(123, 40, 40, 40, '2025-11-21', 75000.00, 'khipu', 'REF-P163', 'aplicado'), -- Paga Oct C40 U40
(124, 41, 41, 41, '2025-11-22', 50000.00, 'servipag', 'REF-P164', 'aplicado'), -- Paga parcial Oct C41 U41
(125, 32, 32, 32, '2025-10-28', 47000.00, 'transferencia', 'REF-P165', 'aplicado'), -- Paga Oct C32 U32
(126, 36, 76, 56, '2025-11-23', 65000.00, 'webpay', 'REF-P166', 'aplicado'), -- Paga Oct C36 U76
(127, 46, 91, 71, '2025-10-29', 40000.00, 'efectivo', 'REF-P167', 'aplicado'), -- Paga Oct C46 U91
(128, 40, 80, 60, '2025-11-24', 78000.00, 'khipu', 'REF-P168', 'aplicado'), -- Paga Oct C40 U80
(129, 41, 81, 61, '2025-11-25', 60000.00, 'servipag', 'REF-P169', 'aplicado'), -- Paga parcial Oct C41 U81
(130, 32, 71, 51, '2025-11-26', 48500.00, 'transferencia', 'REF-P170', 'aplicado'), -- Paga Nov C32 U71 (Asumiendo existe)
(131, 36, 36, 36, '2025-12-01', 99500.00, 'webpay', 'REF-P171', 'aplicado'), -- Paga Nov C36 U36
(132, 46, 46, 46, '2025-12-02', 43500.00, 'efectivo', 'REF-P172', 'aplicado'), -- Paga Nov C46 U46
(133, 49, 49, 49, '2025-12-03', 51500.00, 'khipu', 'REF-P173', 'aplicado'), -- Paga Nov C49 U49
(134, 40, 40, 40, '2025-12-04', 76500.00, 'servipag', 'REF-P174', 'aplicado'), -- Paga Nov C40 U40
(135, 41, 41, 41, '2025-12-05', 61500.00, 'transferencia', 'REF-P175', 'aplicado'), -- Paga Nov C41 U41
(136, 59, 59, 59, '2025-12-06', 86500.00, 'webpay', 'REF-P176', 'aplicado'), -- Paga Nov C59 U59
(137, 32, 32, 32, '2025-12-07', 48500.00, 'efectivo', 'REF-P177', 'aplicado'), -- Paga Nov C32 U32
(138, 36, 76, 56, '2025-12-08', 65000.00, 'khipu', 'REF-P178', 'pendiente'), -- Paga Nov C36 U76 (Pendiente)
(139, 46, 91, 71, '2025-12-09', 40000.00, 'servipag', 'REF-P179', 'pendiente'), -- Paga Nov C46 U91 (Pendiente)
(140, 49, 97, 77, '2025-12-10', 55000.00, 'transferencia', 'REF-P180', 'aplicado'); -- Paga Nov C49 U97

-- Inserts para la tabla 'gasto' (IDs desde 121)
INSERT INTO `gasto` (`id`, `numero`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `estado`, `creado_por`, `aprobado_por`, `glosa`, `extraordinario`) VALUES
(121, 'G-2025-0121', 36, 36, 36, NULL, '2025-11-15', 120000.00, 'aprobado', 6, 6, 'Consumo Gas Central Bosque Nativo Nov', 0),
(122, 'G-2025-0122', 46, 26, 26, NULL, '2025-11-16', 45000.00, 'aprobado', 6, 6, 'Mantención Piscina Chillán Viejo', 0),
(123, 'G-2025-0123', 49, 1, 1, NULL, '2025-11-17', 130000.00, 'aprobado', 6, 6, 'Aseo El Bosque La Florida Nov', 0),
(124, 'G-2025-0124', 40, 40, 40, NULL, '2025-11-18', 60000.00, 'aprobado', 6, 6, 'Fondo Mantención La Dehesa', 0),
(125, 'G-2025-0125', 41, 9, 9, NULL, '2025-11-19', 190000.00, 'aprobado', 6, 6, 'Admin La Reina Alta Nov', 0),
(126, 'G-2025-0126', 59, 20, 20, NULL, '2025-11-20', 100000.00, 'aprobado', 6, 6, 'Conserjería La Serena Nov', 0),
(127, 'G-2025-0127', 32, 32, 32, NULL, '2025-11-21', 50000.00, 'aprobado', 6, 6, 'Consumo Agua Unidades Las Acacias Nov', 0),
(128, 'G-2025-0128', 36, 16, 16, NULL, '2025-11-22', 85000.00, 'pendiente', 6, NULL, 'Remodelación Quincho Bosque Nativo', 1),
(129, 'G-2025-0129', 46, 7, 7, NULL, '2025-11-23', 98000.00, 'aprobado', 6, 6, 'Reparación Ascensor Chillán', 1),
(130, 'G-2025-0130', 49, 17, 17, NULL, '2025-11-24', 40000.00, 'aprobado', 6, 6, 'Internet Común El Bosque La Florida Dic', 0),
(131, 'G-2025-0131', 40, 23, 23, NULL, '2025-11-25', 18000.00, 'aprobado', 6, 6, 'Seguro Incendio La Dehesa', 0),
(132, 'G-2025-0132', 41, 31, 31, NULL, '2025-11-26', 75000.00, 'aprobado', 6, 6, 'Compra Cámaras Seguridad La Reina', 1),
(133, 'G-2025-0133', 59, 11, 11, NULL, '2025-11-27', 90000.00, 'aprobado', 6, 6, 'Mantención Ascensores La Serena Nov', 0),
(134, 'G-2025-0134', 32, 2, 2, NULL, '2025-11-28', 55000.00, 'aprobado', 6, 6, 'Fondo Reserva Las Acacias Nov', 0),
(135, 'G-2025-0135', 36, 1, 1, NULL, '2025-11-29', 110000.00, 'aprobado', 6, 6, 'Aseo Bosque Nativo Nov Extra', 0),
(136, 'G-2025-0136', 46, 26, 26, NULL, '2025-11-30', 47000.00, 'aprobado', 6, 6, 'Mantención Piscina Chillán Nov Extra', 0),
(137, 'G-2025-0137', 49, 1, 1, NULL, '2025-12-01', 135000.00, 'pendiente', 6, NULL, 'Aseo El Bosque La Florida Dic', 0),
(138, 'G-2025-0138', 40, 40, 40, NULL, '2025-12-02', 62000.00, 'pendiente', 6, NULL, 'Fondo Mantención La Dehesa Dic', 0),
(139, 'G-2025-0139', 41, 9, 9, NULL, '2025-12-03', 195000.00, 'pendiente', 6, NULL, 'Admin La Reina Alta Dic', 0),
(140, 'G-2025-0140', 59, 20, 20, NULL, '2025-12-04', 105000.00, 'pendiente', 6, NULL, 'Conserjería La Serena Dic', 0);

-- Inserts para la tabla 'reserva_amenidad' (IDs desde 101)
INSERT INTO `reserva_amenidad` (`id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio`, `fin`, `estado`) VALUES
(101, 36, 36, 36, 36, '2025-12-01 10:00:00', '2025-12-01 12:00:00', 'aprobada'), -- Piscina Interior C36 U36
(102, 46, 26, 46, 46, '2025-12-02 18:00:00', '2025-12-02 20:00:00', 'solicitada'), -- Sauna C46 U46
(103, 49, 1, 49, 49, '2025-12-03 19:00:00', '2025-12-03 23:00:00', 'aprobada'), -- Salon Eventos C49 U49
(104, 40, 40, 40, 40, '2025-12-04 20:00:00', '2025-12-04 23:00:00', 'aprobada'), -- Cine Privado C40 U40
(105, 41, 1, 41, 41, '2025-12-05 18:00:00', '2025-12-05 22:00:00', 'aprobada'), -- Baby Futbol C41 U41 (Asumiendo existe amenidad 1)
(106, 59, 19, 59, 59, '2025-12-06 14:00:00', '2025-12-06 17:00:00', 'aprobada'), -- Est Visitas C59 U59
(107, 32, 2, 32, 32, '2025-12-07 13:00:00', '2025-12-07 17:00:00', 'aprobada'), -- Quincho C32 U32
(108, 36, 36, 76, 56, '2025-12-08 11:00:00', '2025-12-08 13:00:00', 'aprobada'), -- Piscina Interior C36 U76
(109, 46, 26, 91, 71, '2025-12-09 17:00:00', '2025-12-09 19:00:00', 'solicitada'), -- Sauna C46 U91
(110, 49, 1, 97, 77, '2025-12-10 18:30:00', '2025-12-10 22:30:00', 'aprobada'), -- Salon Eventos C49 U97
(111, 40, 40, 80, 60, '2025-12-11 19:30:00', '2025-12-11 22:30:00', 'aprobada'), -- Cine Privado C40 U80
(112, 41, 1, 81, 61, '2025-12-12 17:00:00', '2025-12-12 19:00:00', 'aprobada'), -- Baby Futbol C41 U81
(113, 59, 19, 117, 77, '2025-12-13 15:00:00', '2025-12-13 18:00:00', 'aprobada'), -- Est Visitas C59 U117
(114, 32, 2, 71, 51, '2025-12-14 14:00:00', '2025-12-14 18:00:00', 'aprobada'), -- Quincho C32 U71
(115, 36, 36, 36, 36, '2025-12-15 09:00:00', '2025-12-15 11:00:00', 'rechazada'), -- Piscina C36 U36 (Rechazada)
(116, 46, 26, 46, 46, '2025-12-16 16:00:00', '2025-12-16 18:00:00', 'aprobada'), -- Sauna C46 U46
(117, 49, 1, 49, 49, '2025-12-17 20:00:00', '2025-12-17 23:59:00', 'aprobada'), -- Salon C49 U49
(118, 40, 40, 40, 40, '2025-12-18 21:00:00', '2025-12-18 23:30:00', 'solicitada'), -- Cine C40 U40
(119, 41, 1, 41, 41, '2025-12-19 16:00:00', '2025-12-19 18:00:00', 'aprobada'), -- Baby Futbol C41 U41
(120, 59, 19, 59, 59, '2025-12-20 12:00:00', '2025-12-20 15:00:00', 'cancelada'); -- Est Visitas C59 U59

-- Inserts para la tabla 'lectura_medidor' (IDs desde 101) - Periodo 2025-11
INSERT INTO `lectura_medidor` (`id`, `medidor_id`, `fecha`, `lectura`, `periodo`, `reader_id`, `status`) VALUES
(101, 36, '2025-11-30', 91.500, '2025-11', 6, 'validated'), -- Previa: ELEC-1002 (nueva)
(102, 37, '2025-11-30', 103.000, '2025-11', 6, 'validated'), -- Previa: GAS-1501 (nueva)
(103, 38, '2025-11-30', 129.200, '2025-11', 6, 'validated'), -- Previa: AGUA-106 (nueva)
(104, 39, '2025-11-30', 64.800, '2025-11', 6, 'validated'), -- Previa: ELEC-201-C9 (nueva)
(105, 40, '2025-11-30', 48.100, '2025-11', 6, 'validated'), -- Previa: GAS-202 (nueva)
(106, 1, '2025-11-30', 60.150, '2025-11', 6, 'validated'), -- Repite ID medidor 1, ya existe lectura 61
(107, 2, '2025-11-30', 133.500, '2025-11', 6, 'validated'), -- Repite ID medidor 2, ya existe lectura 62
(108, 3, '2025-11-30', 102.800, '2025-11', 6, 'validated'), -- Repite ID medidor 3, ya existe lectura 63
(109, 11, '2025-11-30', 48.900, '2025-11', 6, 'validated'), -- Repite ID medidor 11, ya existe lectura 64
(110, 12, '2025-11-30', 115.200, '2025-11', 6, 'validated'), -- Repite ID medidor 12, ya existe lectura 65
(111, 13, '2025-11-30', 81.700, '2025-11', 6, 'validated'), -- Repite ID medidor 13, ya existe lectura 66
(112, 21, '2025-11-30', 45.300, '2025-11', 6, 'validated'), -- Repite ID medidor 21, ya existe lectura 67
(113, 22, '2025-11-30', 110.100, '2025-11', 6, 'validated'), -- Repite ID medidor 22, ya existe lectura 68
(114, 23, '2025-11-30', 78.500, '2025-11', 6, 'validated'), -- Repite ID medidor 23, ya existe lectura 69
(115, 31, '2025-11-30', 47.000, '2025-11', 6, 'validated'), -- Repite ID medidor 31, ya existe lectura 70
(116, 32, '2025-11-30', 118.300, '2025-11', 6, 'validated'), -- Repite ID medidor 32, ya existe lectura 71
(117, 33, '2025-11-30', 85.400, '2025-11', 6, 'validated'), -- Repite ID medidor 33, ya existe lectura 72
(118, 4, '2025-11-30', 75.800, '2025-11', 6, 'validated'), -- Repite ID medidor 4, ya existe lectura 73
(119, 5, '2025-11-30', 162.900, '2025-11', 6, 'validated'), -- Repite ID medidor 5, ya existe lectura 74
(120, 6, '2025-11-30', 99.100, '2025-11', 6, 'validated'); -- Repite ID medidor 6, ya existe lectura 75

-- Inserts para la tabla 'ticket_soporte' (IDs desde 71)
INSERT INTO `ticket_soporte` (`id`, `comunidad_id`, `unidad_id`, `categoria`, `titulo`, `descripcion`, `estado`, `prioridad`, `asignado_a`) VALUES
(71, 36, 36, 'Mantención', 'Revisar calefacción central', 'No calienta lo suficiente.', 'abierto', 'media', 1),
(72, 46, 46, 'Limpieza', 'Limpieza post mudanza D801', 'Unidad D801 desocupada, necesita limpieza.', 'abierto', 'baja', 6),
(73, 49, 49, 'Seguridad', 'Cámaras piso 5 offline', 'Cámaras del pasillo piso 5 no transmiten.', 'en_progreso', 'alta', 2),
(74, 40, 40, 'Áreas Comunes', 'Reposición ampolleta Quincho', 'Ampolleta quemada en quincho principal.', 'abierto', 'baja', NULL),
(75, 41, 41, 'Electricidad', 'Enchufe sin corriente D101', 'Enchufe del living no funciona.', 'abierto', 'media', 8),
(76, 59, 59, 'Jardinería', 'Pasto crecido sector juegos', 'Necesita corte de pasto urgente.', 'abierto', 'media', NULL),
(77, 32, 32, 'Plomería', 'Fuga agua medidor D301', 'Se observa goteo en el medidor de agua.', 'abierto', 'alta', 7),
(78, 36, 76, 'Ascensor', 'Botón PB no ilumina', 'Luz del botón de Planta Baja no enciende.', 'abierto', 'baja', 3),
(79, 46, 91, 'Administración', 'Solicitud copia reglamento', 'Residente nuevo solicita copia del reglamento.', 'cerrado', 'baja', 1),
(80, 49, 97, 'Mantención', 'Silla rota sala de espera', 'Una silla de la recepción tiene pata quebrada.', 'abierto', 'baja', NULL),
(81, 40, 80, 'Seguridad', 'Alarma D900 sonando', 'Alarma de departamento suena intermitentemente.', 'en_progreso', 'alta', 2),
(82, 41, 81, 'Limpieza', 'Mancha aceite estacionamiento E101', 'Limpiar mancha de aceite.', 'abierto', 'media', 6),
(83, 59, 117, 'Áreas Comunes', 'Puerta acceso bodega B2001 atascada', 'Cuesta abrir la puerta de la bodega.', 'abierto', 'media', NULL),
(84, 32, 71, 'Electricidad', 'Luz parpadeante baño D1301', 'Luz del baño principal parpadea.', 'abierto', 'baja', 8),
(85, 36, 36, 'Gas', 'Revisión Sello Verde D501', 'Programar inspección para renovación.', 'abierto', 'media', 7),
(86, 46, 46, 'Jardinería', 'Arbusto seco entrada Chillán', 'Retirar arbusto seco.', 'resuelto', 'baja', NULL),
(87, 49, 49, 'Mantención', 'Bisagra suelta puerta acceso T03', 'Puerta principal de Torre C.', 'abierto', 'media', 1),
(88, 40, 40, 'Iluminación', 'Foco quemado subterráneo -2', 'Zona E100 oscura.', 'abierto', 'media', 8),
(89, 41, 41, 'Infraestructura', 'Cerámica suelta pasillo piso 5', 'Cerámica cerca de D501.', 'abierto', 'media', NULL),
(90, 59, 59, 'Seguridad', 'Problema con tarjeta acceso', 'Tarjeta de residente D2001 no funciona.', 'abierto', 'alta', 2);

-- Inserts para la tabla 'registro_conserjeria' (IDs desde 101)
INSERT INTO `registro_conserjeria` (`id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`) VALUES
(101, 36, '2025-11-06 14:00:00', 6, 'reporte', 'Unidad D501 (C36) reporta calefacción baja (Ticket #71).'),
(102, 46, '2025-11-07 09:00:00', 6, 'visita', 'Personal de limpieza para unidad D801 (C46).'),
(103, 49, '2025-11-07 16:00:00', 6, 'reporte', 'Cámaras piso 5 offline (C49) (Ticket #73).'),
(104, 40, '2025-11-08 10:00:00', 6, 'mantencion', 'Se cambia ampolleta quemada en quincho (C40).'),
(105, 41, '2025-11-08 15:30:00', 6, 'reporte', 'Enchufe sin corriente D101 (C41) (Ticket #75).'),
(106, 59, '2025-11-09 11:00:00', 6, 'mantencion', 'Se coordina corte de pasto sector juegos (C59).'),
(107, 32, '2025-11-09 17:00:00', 6, 'reporte', 'Fuga agua medidor D301 (C32) (Ticket #77).'),
(108, 36, '2025-11-10 10:00:00', 6, 'visita', 'Técnico revisa botón PB ascensor T1 (C36).'),
(109, 46, '2025-11-10 14:00:00', 6, 'entrega', 'Residente D801 (C46) retira copia reglamento.'),
(110, 49, '2025-11-11 09:30:00', 6, 'reporte', 'Silla rota en recepción (C49) (Ticket #80).'),
(111, 40, '2025-11-11 16:00:00', 6, 'reporte', 'Alarma D900 sonando (C40) (Ticket #81).'),
(112, 41, '2025-11-12 10:00:00', 6, 'mantencion', 'Se solicita limpieza mancha aceite E101 (C41).'),
(113, 59, '2025-11-12 13:00:00', 6, 'reporte', 'Puerta bodega B2001 atascada (C59) (Ticket #83).'),
(114, 32, '2025-11-13 11:00:00', 6, 'reporte', 'Luz parpadeante baño D1301 (C32) (Ticket #84).'),
(115, 36, '2025-11-13 15:00:00', 6, 'visita', 'Técnico de gas para revisión Sello Verde D501 (C36).'),
(116, 46, '2025-11-14 10:00:00', 6, 'mantencion', 'Se retira arbusto seco de entrada (C46).'),
(117, 49, '2025-11-14 14:30:00', 6, 'visita', 'Maestro revisa bisagra puerta T03 (C49).'),
(118, 40, '2025-11-15 09:00:00', 6, 'reporte', 'Foco quemado subterráneo -2 (C40) (Ticket #88).'),
(119, 41, '2025-11-15 16:00:00', 6, 'reporte', 'Cerámica suelta pasillo piso 5 (C41) (Ticket #89).'),
(120, 59, '2025-11-16 10:00:00', 6, 'reporte', 'Tarjeta acceso D2001 no funciona (C59) (Ticket #90).');
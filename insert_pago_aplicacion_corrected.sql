-- INSERT corregido para pago_aplicacion - evitando duplicados en la combinación pago_id-cargo_unidad_id
-- La tabla tiene una restricción única en (pago_id, cargo_unidad_id)

INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cargo_unidad_id`, `monto`, `prioridad`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 47012.50, 1, NOW(), NOW()),
(2, 2, 2, 35259.38, 1, NOW(), NOW()),
(3, 3, 4, 17608.00, 1, NOW(), NOW()),
(4, 4, 6, 13492.60, 1, NOW(), NOW()),
(5, 5, 7, 7496.17, 1, NOW(), NOW()),
(6, 6, 8, 98175.00, 1, NOW(), NOW()),
(7, 7, 9, 23016.00, 1, NOW(), NOW()),
(8, 8, 10, 38556.50, 1, NOW(), NOW()),
(9, 2, 3, 11753.12, 2, NOW(), NOW()),  -- Cambiado cargo_unidad_id de 2 a 3
(10, 5, 5, 7496.16, 2, NOW(), NOW());  -- Cambiado cargo_unidad_id de 7 a 5

-- Notas:
-- - Record 9: Cambié cargo_unidad_id de 2 a 3 para evitar duplicado con record 2
-- - Record 10: Cambié cargo_unidad_id de 7 a 5 para evitar duplicado con record 5
-- - Cada combinación (pago_id, cargo_unidad_id) ahora es única
-- - Los montos y prioridades se mantienen según el diseño original
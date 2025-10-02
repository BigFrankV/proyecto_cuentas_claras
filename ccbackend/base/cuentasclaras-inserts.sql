-- =====================================================================================================================
-- ARCHIVO DE DATOS DE PRUEBA - CUENTAS CLARAS
-- =====================================================================================================================
-- 
-- ⚠️ IMPORTANTE: ORDEN DE CARGA DE DATOS
-- =====================================================================================================================
-- 
-- Este archivo contiene datos de prueba para popular la base de datos.
-- DEBE ejecutarse TABLA POR TABLA en el orden especificado para evitar errores de Foreign Keys.
-- 
-- 📋 ORDEN DE EJECUCIÓN REQUERIDO:
-- 
-- 1. comunidad          ← Sin dependencias (tabla base)
-- 2. persona            ← Sin dependencias (tabla base)
-- 3. usuario            ← Depende de: persona
-- 4. rol                ← Sin dependencias (tabla de catálogo)
-- 5. usuario_comunidad_rol  ← Depende de: usuario, comunidad, rol
-- 6. edificio           ← Depende de: comunidad
-- 7. torre              ← Depende de: edificio
-- 8. unidad             ← Depende de: edificio, torre (opcional), comunidad
-- 9. titulares_unidad   ← Depende de: unidad, persona
-- 10. categoria_gasto   ← Depende de: comunidad
-- 11. proveedor         ← Depende de: comunidad
-- 12. documento_compra  ← Depende de: comunidad, proveedor
-- 13. gasto             ← Depende de: comunidad, categoria_gasto, proveedor
-- 14. emision_gastos_comunes  ← Depende de: comunidad
-- 15. cuenta_cobro_unidad     ← Depende de: emision_gastos_comunes, comunidad, unidad
-- 16. pago              ← Depende de: comunidad, unidad, persona
-- 17. pago_aplicacion   ← Depende de: pago, cuenta_cobro_unidad
-- 18. multa             ← Depende de: comunidad, unidad, persona
-- 19. amenidad          ← Depende de: comunidad
-- 20. reserva_amenidad  ← Depende de: amenidad, unidad, persona
-- 21. medidor           ← Depende de: comunidad, unidad
-- 22. lectura_medidor   ← Depende de: medidor
-- 23. notificacion      ← Depende de: comunidad, usuario
-- 24. solicitud_soporte ← Depende de: comunidad, usuario
-- 
-- ⚠️ SI EJECUTAS TODO EL ARCHIVO A LA VEZ, PUEDES OBTENER ERRORES COMO:
--    - "Cannot add or update a child row: a foreign key constraint fails"
--    - "Error 1452: Cannot add or update a child row"
-- 
-- ✅ SOLUCIÓN RECOMENDADA:
--    Ejecuta los INSERTs uno por uno, respetando el orden listado arriba.
--    O bien, ejecuta cada sección con:
--    
--    mysql -u root -p cuentasclaras < cuentasclaras-inserts.sql
--    
--    Y asegúrate que el archivo esté ordenado correctamente.
-- 
-- 📝 NOTAS ADICIONALES:
--    - Los IDs están definidos explícitamente para mantener consistencia
--    - Usa ON DUPLICATE KEY UPDATE si necesitas re-ejecutar el script
--    - Valida las Foreign Keys con: SHOW CREATE TABLE nombre_tabla;
-- 
-- =====================================================================================================================

-- =====================================================================================================================
-- 1. TABLA: comunidad (Sin dependencias)
-- =====================================================================================================================

INSERT INTO `comunidad` (id, razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto, moneda, tz, created_at, updated_at, created_by, updated_by) VALUES
(1, 'Comunidad Providencia #1', '10629071', '7', 'Administración de edificios', 'Acceso Remedios Barriga #652, Providencia', 'edelmira15@bueno.es', '+34705 39 27 73', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(2, 'Comunidad Las Condes #2', '10609747', 'K', 'Administración de edificios', 'Rambla de Macario Toro #943, Las Condes', 'kcalderon@duran.com', '+34 742134113', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(3, 'Comunidad Ñuñoa #3', '2869069', 'K', 'Administración de edificios', 'Urbanización de María José Rosselló #576, Ñuñoa', 'ltovar@gmail.com', '+34739 788 839', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(4, 'Comunidad La Florida #4', '18608281', '8', 'Administración de edificios', 'Camino Caridad Aznar #237, La Florida', 'vivianacifuentes@yahoo.com', '+34 808 205 869', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(5, 'Comunidad Maipú #5', '8908658', '2', 'Administración de edificios', 'Plaza de Nando Barreda #909, Maipú', 'marizoraida@gallo.es', '+34 729189931', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(6, 'Comunidad Puente Alto #6', '3825858', '3', 'Administración de edificios', 'Via de Julio César Fuente #319, Puente Alto', 'julian45@gmail.com', '+34617 749 516', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(7, 'Comunidad Recoleta #7', '8665376', '1', 'Administración de edificios', 'Pasaje Cipriano Zabala #513, Recoleta', 'amormartinez@gmail.com', '+34635 66 18 45', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(8, 'Comunidad Independencia #8', '3119699', 'K', 'Administración de edificios', 'Glorieta de Ana Sofía Juan #111, Independencia', 'benavidesurbano@vara.es', '+34744 980 552', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(9, 'Comunidad Macul #9', '5592832', '0', 'Administración de edificios', 'Urbanización Cristian Cabañas #401, Macul', 'teresitamadrigal@cabrero.es', '+34741 860 103', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(10, 'Comunidad San Miguel #10', '21940255', '4', 'Administración de edificios', 'Pasaje Marciano Pareja #677, San Miguel', 'boixjose-maria@yahoo.com', '+34707 821 376', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(11, 'Comunidad Lo Barnechea #11', '2186385', '8', 'Administración de edificios', 'Urbanización Felipe Vilaplana #919, Lo Barnechea', 'felisa53@hotmail.com', '+34600619716', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(12, 'Comunidad Vitacura #12', '7821754', '5', 'Administración de edificios', 'Plaza de Guadalupe Amigó #498, Vitacura', 'vascoduenas@hotmail.com', '+34983 42 13 16', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(13, 'Comunidad Santiago #13', '16700137', '8', 'Administración de edificios', 'Cañada de Ariel Marí #256, Santiago', 'xpablo@hotmail.com', '+34 728 29 59 33', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(14, 'Comunidad Providencia #14', '6694659', '2', 'Administración de edificios', 'Urbanización de Reyes Toro #773, Providencia', 'candelas21@batalla.com', '+34710480690', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(15, 'Comunidad Las Condes #15', '11259073', '0', 'Administración de edificios', 'Cuesta de Estrella Alcalde #148, Las Condes', 'tiradoisaac@collado-bertran.com', '+34 729511574', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(16, 'Comunidad Ñuñoa #16', '11223649', 'K', 'Administración de edificios', 'Glorieta de Lino Real #525, Ñuñoa', 'gamezsusana@costa.es', '+34 823151975', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(17, 'Comunidad La Florida #17', '1271048', '8', 'Administración de edificios', 'Alameda Herberto Solana #466, La Florida', 'muria@aguirre-pomares.com', '+34 629 216 748', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(18, 'Comunidad Maipú #18', '13466150', 'K', 'Administración de edificios', 'C. de Vinicio Salazar #46, Maipú', 'ntena@colom.com', '+34 928 57 50 13', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(19, 'Comunidad Puente Alto #19', '23884158', '5', 'Administración de edificios', 'Callejón Leonor Rodríguez #597, Puente Alto', 'julianbenito@hotmail.com', '+34 728 890 470', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(20, 'Comunidad Recoleta #20', '4164577', '6', 'Administración de edificios', 'Pasaje de Maximiano Alfonso #440, Recoleta', 'angelina85@fabregat-galindo.es', '+34 884 258 433', 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL);

INSERT INTO `persona` (id, rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at) VALUES
(1, '15717183', '6', 'Isaura', 'Solé', 'nvalero@moreno.es', '+34817829633', 'Rambla Roxana Ortega 5, Zamora, 02237', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(2, '11243882', '3', 'Elisabet', 'Robledo', 'marcosblasco@iglesias.es', '+34747 970 941', 'Plaza de Nuria Sosa 66 Puerta 3 , Almería, 85513', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, '21141366', '2', 'Dalila', 'Trillo', 'candelarioguardiola@gmail.com', '+34662 265 789', 'Camino de Dolores Álvaro 23 Puerta 6 , Toledo, 78909', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, '9793463', '0', 'Isidora', 'Sedano', 'casalsteofilo@requena-bermejo.org', '+34722553671', 'C. Paloma Santiago 72 Piso 1 , Toledo, 04314', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, '2569079', '6', 'Sigfrido', 'Molins', 'vinascurro@guillen.com', '+34735 438 670', 'Paseo Lucio Duarte 758 Piso 2 , Lleida, 52993', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, '24317602', '6', 'José', 'Álvaro', 'dquiros@cuenca.com', '+34 700 568 329', 'Camino María Pilar Gascón 4 Piso 7 , Ourense, 29204', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, '21596168', '0', 'Jordi', 'Piñol', 'graciana71@yahoo.com', '+34 718 30 61 91', 'Callejón Perlita Pérez 92 Piso 8 , Ciudad, 39093', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, '17147778', '6', 'Flora', 'Olivares', 'carlosrio@gmail.com', '+34 744255609', 'Plaza de Reynaldo Casanova 4, Salamanca, 60639', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, '9974052', '3', 'Lina', 'Alonso', 'elpidio14@yahoo.com', '+34685452794', 'Plaza Gregorio Naranjo 80, Ciudad, 24056', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, '11788735', '9', 'Alejandro', 'Barros', 'bguardiola@palomino.com', '+34722 378 565', 'Cañada de Atilio Solana 31, Ciudad, 28746', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, '3710552', 'K', 'Almudena', 'Vigil', 'ucolomer@sabater.com', '+34 727175045', 'Urbanización de Mohamed Santiago 57, Jaén, 57332', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, '20045825', '7', 'Fortunata', 'Morata', 'dionisia40@ribas-cerda.org', '+34 712 21 98 21', 'Ronda Vilma Pardo 5, Ceuta, 00814', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, '4555786', '3', 'Dafne', 'Bertrán', 'chidalgo@ortega-villalba.es', '+34 809763799', 'Rambla de Teodora Águila 307, Navarra, 06990', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, '8604517', '6', 'Hernando', 'Español', 'alfonsopinedo@elorza-francisco.com', '+34912 51 64 52', 'Callejón de Susanita Arce 94 Apt. 22 , Barcelona, 60790', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, '12651003', '9', 'Lope', 'Conesa', 'acunarosario@barral.es', '+34674 39 47 51', 'Plaza de Manolo Acosta 81 Puerta 6 , Burgos, 28744', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, '16222694', '0', 'Ricarda', 'Alvarez', 'domingo91@hotmail.com', '+34 648 983 048', 'Alameda Rufina Ferrán 36 Piso 7 , Vizcaya, 64870', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, '14584777', 'K', 'Albino', 'Nicolás', 'salomeduran@hotmail.com', '+34950 315 479', 'Alameda Manu Calatayud 19 Puerta 6 , Albacete, 85684', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, '5163812', '3', 'Nidia', 'Santiago', 'xmorata@raya.net', '+34 718 536 165', 'Alameda Elba Torrents 206 Apt. 73 , Zamora, 81227', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, '4439658', '0', 'Candelas', 'Berenguer', 'marianela97@acuna.com', '+34994 64 38 76', 'Alameda de Iker Aguirre 31 Puerta 5 , Ávila, 19392', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, '13051081', '7', 'Jenny', 'Carnero', 'goyoarias@yahoo.com', '+34 706 33 85 67', 'Urbanización Mohamed Soriano 8, Salamanca, 19993', '2025-10-02 18:00:09', '2025-10-02 18:00:09');

INSERT INTO `proveedor` (id, comunidad_id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at, updated_at) VALUES
(1, 1, '1668344', '2', 'Carranza, Izquierdo and Bernal Ltda.', 'Scientist, physiological', 'iaranda@romero.es', '+34731 01 93 99', 'Via Teodora Gilabert 507 Apt. 82 , Burgos, 46465', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(2, 6, '23515615', '6', 'Godoy LLC Ltda.', 'Training and development officer', 'lgomez@ferrando.com', '+34 705 082 873', 'Acceso de Aurelia Landa 12, León, 96566', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, 13, '15190837', '3', 'Arroyo-Campillo Ltda.', 'Education officer, community', 'dimas19@cazorla.com', '+34 837 22 10 28', 'Ronda de Álvaro Delgado 10, Murcia, 36699', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, 3, '17829130', '0', 'Gracia, Pinto and Tello Ltda.', 'Occupational psychologist', 'goyoquesada@jurado-yanez.com', '+34733254507', 'Pasadizo Ángela Agustí 509 Piso 0 , Cantabria, 32363', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, 14, '8745088', '0', 'Lucas-Ibáñez Ltda.', 'Exhibition designer', 'naguilar@bas.com', '+34745 43 45 87', 'Urbanización Esperanza Garrido 90 Puerta 0 , Huelva, 81567', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, 9, '21074587', '4', 'Gallo, Egea and Valbuena Ltda.', 'Engineer, energy', 'hectorpatino@lluch.com', '+34 702 322 985', 'Rambla Atilio Grande 683 Apt. 65 , Segovia, 98403', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, 18, '16764395', '7', 'Córdoba Ltd Ltda.', 'Garment/textile technologist', 'lara58@calderon.com', '+34730 788 387', 'Avenida Candelaria Gascón 30, Santa Cruz de Tenerife, 87899', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, 11, '15494654', '3', 'Luna Ltd Ltda.', 'Tax inspector', 'qrivas@villaverde.net', '+34855650887', 'Glorieta de Íngrid Benítez 145 Apt. 64 , Tarragona, 03296', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, 6, '22835711', '1', 'Arnau-Mendoza Ltda.', 'Insurance broker', 'lastraanselmo@nogues.com', '+34737965563', 'Urbanización Beatriz Alfonso 66, Pontevedra, 61350', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, 20, '11474595', '2', 'Salamanca Inc Ltda.', 'Commercial/residential surveyor', 'oteroedgar@sastre-munoz.es', '+34933 700 560', 'Cuesta de Rosario Valenzuela 66 Apt. 22 , Navarra, 61669', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, 2, '10392877', 'K', 'Oller-Vilaplana Ltda.', 'Ship broker', 'juliavalero@almagro-luna.es', '+34987 27 51 76', 'C. Serafina Borja 1 Piso 3 , Palencia, 22723', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, 10, '6298524', '0', 'Trujillo, Leon and Palacio Ltda.', 'Scientist, research (maths)', 'valentinamurillo@guillen.net', '+34719 906 951', 'Calle de Gabriel Salinas 1 Apt. 96 , Baleares, 09978', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, 10, '1573846', '4', 'Cabañas, Andrés and Barberá Ltda.', 'Outdoor activities/education manager', 'fuertesbruno@roma.es', '+34 712229870', 'Ronda Andrés Felipe Barreda 900 Puerta 8 , Cuenca, 73860', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, 6, '18004790', '5', 'Niño PLC Ltda.', 'Travel agency manager', 'chamorromodesta@villalonga.es', '+34 875057627', 'Cañada de Jimena Alcántara 40 Puerta 0 , La Coruña, 26687', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, 17, '5826803', '8', 'Rivas LLC Ltda.', 'Designer, industrial/product', 'anacleto52@trujillo.es', '+34 700 18 98 64', 'Rambla José María Zorrilla 18, Tarragona, 40316', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, 16, '5900452', '2', 'Ureña LLC Ltda.', 'Engineer, civil (contracting)', 'gvillalba@sevillano-girona.net', '+34620904969', 'Callejón Che Patiño 3, Cuenca, 40987', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, 18, '4754134', '4', 'Ballester LLC Ltda.', 'Claims inspector/assessor', 'yayllon@nogueira.com', '+34 974609521', 'Alameda de Rafael Acuña 319 Apt. 45 , Toledo, 14095', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, 20, '14654064', '3', 'Mayoral Ltd Ltda.', 'Scientist, marine', 'wbayona@tapia.com', '+34 905851301', 'Plaza de Juliana Castilla 18 Puerta 3 , Guadalajara, 54238', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, 14, '8717061', '6', 'Martorell, Calzada and Gallo Ltda.', 'Tour manager', 'olmoagata@blanes-armas.es', '+34808 85 89 85', 'Alameda de Sabas Artigas 27, Cuenca, 87978', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, 8, '23656610', '2', 'Ropero and Sons Ltda.', 'Rural practice surveyor', 'zuritaartemio@manrique-guardiola.org', '+34742 35 81 55', 'Pasaje de Andrés Agullo 1 Piso 7 , Almería, 69938', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09');

INSERT INTO `usuario` (id, persona_id, username, hash_password, email, activo, created_at, updated_at, is_superadmin, totp_secret, totp_enabled) VALUES
(1, 1, 'user1', 'c2cac9a3bcddbe2194d71d4122b30afde457d2e4e6d1bd5d97be87c875e21595', 'nvalero@moreno.es', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(2, 2, 'user2', 'a5e9593c9edf1127885d64d614d7c85dbb65d76365f577e78c11e2410a7bf0f0', 'marcosblasco@iglesias.es', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(3, 3, 'user3', 'a1dab82e4de60f14f63b6b0dd3581d531dc109ffa204b70a29c7e2fdb06c5207', 'candelarioguardiola@gmail.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(4, 4, 'user4', '3e51dc031538f0b6943bc4494c27d9da8bf02ab78a77947679d25fdbd2716da5', 'casalsteofilo@requena-bermejo.org', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(5, 5, 'user5', 'd6a0ca7dd505d15e4f5590f0d938111ed59c46af1145ce4055b0625ae8cd293e', 'vinascurro@guillen.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(6, 6, 'user6', 'a5ffa1c98f13ae6a3aadac79dac8725479a1d7b910168585c731de247073a83f', 'dquiros@cuenca.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(7, 7, 'user7', '6a359c67ca3006313a5b19c4b761234819b4c68949465c5cd9f96fdabeaa4013', 'graciana71@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(8, 8, 'user8', '356df24dbca48c894cf8dc568b2acd3bcbc13260b30e89adaf913984d1aad02c', 'carlosrio@gmail.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(9, 9, 'user9', 'f25dc7a443c883127a288561b7f6b207f4d1f7b492a12284250b1a784ccae8fe', 'elpidio14@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(10, 10, 'user10', 'cf145663e2fb2bc5f3806bc9828e351b868976df1d7ad910060e261e47ae9529', 'bguardiola@palomino.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(11, 11, 'user11', 'b49e74620e3da7fd64d15bd295c515ede3bc2f89487b1ef9d5538036e8ae400d', 'ucolomer@sabater.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(12, 12, 'user12', 'd607c260dfd45f62660452c1432ab5f487f700359841d9c188d1e62d76ca2d6a', 'dionisia40@ribas-cerda.org', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(13, 13, 'user13', 'c214f7401855047f3b43ad71bd176b01d469e6959262f47dcae4669e1e5df9df', 'chidalgo@ortega-villalba.es', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(14, 14, 'user14', '96af6ae9efb1320b4e9e88541a063266214037ada7bb91f793e2169c2642eed3', 'alfonsopinedo@elorza-francisco.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(15, 15, 'user15', 'd0fa064fb51f577fb1d00c653830c298c8dd131ee5b55681e1abb2ee1d7cd5eb', 'acunarosario@barral.es', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(16, 16, 'user16', '076170f6c6c49e2b39135ad26224937c3a198724a37538ae1f31d70a694b38c2', 'domingo91@hotmail.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(17, 17, 'user17', '3eee76e7cc80183a1709ca450a1af39ba2270533417d7558804aa57059f66b03', 'salomeduran@hotmail.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(18, 18, 'user18', '20e4d32995dfccee1c02ac4519e1e112dc161eb57a07797b0e1932a1f86f4253', 'xmorata@raya.net', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(19, 19, 'user19', '48e66c44985f8be6edb70b7ef0bac2dbc50776b6b0545b56feb0590119ae1b37', 'marianela97@acuna.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0),
(20, 20, 'user20', 'eb596068fd46088f1870436cb5e4e9baf3a4321be10e79a4d6b5706dc68d1e8c', 'goyoarias@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09', 0, NULL, 0);

INSERT INTO `usuario_comunidad_rol` (id, usuario_id, comunidad_id, rol_id, desde, hasta, activo, created_at, updated_at) VALUES
(1, 1, 6, 6, '2023-02-04 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(2, 2, 7, 2, '2023-11-18 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, 3, 15, 4, '2023-12-22 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, 4, 5, 2, '2024-09-29 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, 5, 13, 2, '2023-09-01 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, 6, 16, 3, '2023-03-26 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, 7, 6, 3, '2023-08-21 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, 8, 10, 3, '2023-01-10 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, 9, 2, 7, '2023-08-03 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, 10, 5, 6, '2024-04-07 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, 11, 13, 7, '2024-01-24 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, 12, 16, 7, '2024-04-28 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, 13, 17, 2, '2022-10-31 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, 14, 15, 4, '2022-10-24 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, 15, 14, 6, '2023-05-29 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, 16, 4, 6, '2023-10-15 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, 17, 17, 4, '2024-08-30 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, 18, 14, 3, '2024-08-29 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, 19, 11, 7, '2024-07-25 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, 20, 13, 2, '2023-01-19 00:00:00', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09');


INSERT INTO `edificio` (id, comunidad_id, nombre, direccion, codigo, created_at, updated_at) VALUES
(1, 10, 'Edificio Via Melchor Mancebo', 'Pasadizo Pilar Rueda 92, Lugo, 92941', 'ED001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 18, 'Edificio Plaza de Irma Amador', 'Rambla Eugenio Fiol 19 Piso 4 , Ourense, 11742', 'ED002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 20, 'Edificio Callejón Juan Luis Lledó', 'C. Clemente Miguel 445 Piso 9 , Burgos, 62819', 'ED003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 9, 'Edificio Cuesta de Raúl Oliver', 'Urbanización Clara Meléndez 56 Piso 3 , Soria, 65663', 'ED004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 2, 'Edificio Calle Severino Martorell', 'Pasadizo Ruy Serra 85 Apt. 64 , Almería, 45665', 'ED005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 5, 'Edificio Vial Dolores Avilés', 'Pasadizo de Espiridión Bastida 562, Ciudad, 95436', 'ED006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 16, 'Edificio C. de Ramona Ferrández', 'Callejón de Plácido Arana 13 Piso 4 , Guipúzcoa, 06886', 'ED007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 17, 'Edificio Callejón de Brígida Sobrino', 'Urbanización Petrona Amor 26 Piso 9 , Soria, 24102', 'ED008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 3, 'Edificio C. Pablo Cabañas', 'Pasaje Rosa Tur 30, Cáceres, 70528', 'ED009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 18, 'Edificio Camino Reyna Bermúdez', 'Ronda de Matías Sevilla 43 Apt. 49 , Jaén, 52397', 'ED010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 18, 'Edificio Urbanización de Griselda Monreal', 'Via de Benita Ferrer 358, Cáceres, 70444', 'ED011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 10, 'Edificio Cañada Marina Alcántara', 'Avenida de Alicia Lago 60, Soria, 21412', 'ED012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 4, 'Edificio Camino Ángela Núñez', 'Callejón de Jacobo Castejón 48 Piso 6 , Murcia, 80033', 'ED013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 10, 'Edificio Alameda Víctor Llorente', 'Cañada de Virgilio Lobo 794, Albacete, 56269', 'ED014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 7, 'Edificio Ronda Atilio Figuerola', 'Plaza Rómulo Aguilera 98 Apt. 13 , Ciudad, 66884', 'ED015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 12, 'Edificio Urbanización de Manuel Alberola', 'Avenida de Elodia Morillo 72, Melilla, 46757', 'ED016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 18, 'Edificio C. Elisa Ferrándiz', 'Paseo de Yaiza Torrens 76 Puerta 3 , Segovia, 49268', 'ED017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 15, 'Edificio Ronda Teófila Plana', 'Glorieta Cesar Anguita 5 Puerta 2 , Valladolid, 42780', 'ED018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 7, 'Edificio Plaza Salvador Chacón', 'Pasaje de Ani Blanch 385 Piso 5 , Teruel, 44033', 'ED019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 14, 'Edificio C. de Lorenza Hurtado', 'Avenida de Palmira Catalá 8 Piso 9 , Albacete, 17883', 'ED020', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `torre` (id, edificio_id, nombre, codigo, created_at, updated_at) VALUES
(1, 1, 'Torre B', 'T001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 2, 'Torre C', 'T002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 3, 'Torre D', 'T003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 4, 'Torre E', 'T004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 5, 'Torre F', 'T005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 6, 'Torre G', 'T006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 'Torre H', 'T007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 8, 'Torre I', 'T008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 9, 'Torre J', 'T009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 10, 'Torre K', 'T010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 11, 'Torre L', 'T011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 12, 'Torre M', 'T012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 13, 'Torre N', 'T013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 14, 'Torre O', 'T014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 15, 'Torre P', 'T015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 16, 'Torre Q', 'T016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 17, 'Torre R', 'T017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 18, 'Torre S', 'T018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 19, 'Torre T', 'T019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 20, 'Torre U', 'T020', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `unidad` (id, comunidad_id, edificio_id, torre_id, codigo, alicuota, m2_utiles, m2_terrazas, nro_bodega, nro_estacionamiento, activa, created_at, updated_at) VALUES
(1, 12, 7, 7, 'U001', 0.021523, 65.88, 7.6, 'B001', 'E001', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 17, 3, 13, 'U002', 0.010362, 70.73, 13.13, 'B002', 'E002', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 20, 18, 2, 'U003', 0.006624, 118.3, 18.93, 'B003', 'E003', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 12, 14, 9, 'U004', 0.017598, 75.79, 9.82, 'B004', 'E004', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 19, 5, 4, 'U005', 0.018412, 58.61, 5.42, 'B005', 'E005', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 13, 5, 13, 'U006', 0.009389, 66.45, 19.46, 'B006', 'E006', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 14, 5, 11, 'U007', 0.01777, 87.06, 14.33, 'B007', 'E007', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 6, 11, 2, 'U008', 0.020005, 74.86, 9.55, 'B008', 'E008', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 6, 13, 6, 'U009', 0.024811, 42.86, 5.36, 'B009', 'E009', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 18, 18, 7, 'U010', 0.02361, 54.17, 14.47, 'B010', 'E010', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 15, 17, 20, 'U011', 0.022403, 45.74, 6.71, 'B011', 'E011', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 15, 5, 16, 'U012', 0.017768, 85.03, 5.8, 'B012', 'E012', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 16, 20, 4, 'U013', 0.020766, 95.13, 8.55, 'B013', 'E013', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 15, 15, 8, 'U014', 0.015158, 64.6, 6.68, 'B014', 'E014', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 13, 11, 7, 'U015', 0.019276, 111.38, 15.99, 'B015', 'E015', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 6, 5, 5, 'U016', 0.005108, 117.7, 15.11, 'B016', 'E016', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 20, 15, 7, 'U017', 0.024073, 98.57, 5.21, 'B017', 'E017', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 10, 10, 14, 'U018', 0.022069, 75.53, 13.53, 'B018', 'E018', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 19, 16, 17, 'U019', 0.013526, 49.13, 14.08, 'B019', 'E019', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 8, 16, 2, 'U020', 0.015334, 63.84, 17.38, 'B020', 'E020', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `titulares_unidad` (id, comunidad_id, unidad_id, persona_id, tipo, desde, hasta, porcentaje, created_at, updated_at) VALUES
(1, 12, 1, 8, 'arrendatario', '2020-10-15 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 17, 2, 15, 'arrendatario', '2021-12-03 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 20, 3, 5, 'arrendatario', '2022-05-25 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 12, 4, 3, 'arrendatario', '2021-09-25 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 19, 5, 10, 'propietario', '2022-07-12 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 13, 6, 9, 'arrendatario', '2020-11-24 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 14, 7, 17, 'propietario', '2021-07-20 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 6, 8, 9, 'arrendatario', '2022-11-15 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 6, 9, 18, 'propietario', '2022-08-26 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 18, 10, 6, 'arrendatario', '2023-03-01 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 15, 11, 5, 'arrendatario', '2022-05-06 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 15, 12, 17, 'arrendatario', '2023-02-08 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 16, 13, 3, 'propietario', '2021-01-18 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 15, 14, 20, 'arrendatario', '2022-02-18 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 13, 15, 11, 'arrendatario', '2022-10-04 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 6, 16, 3, 'propietario', '2021-07-17 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 20, 17, 14, 'arrendatario', '2022-02-06 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 10, 18, 18, 'arrendatario', '2022-01-01 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 19, 19, 1, 'propietario', '2021-10-23 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 8, 20, 19, 'arrendatario', '2022-08-19 00:00:00', NULL, 100.0, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `categoria_gasto` (id, comunidad_id, nombre, tipo, cta_contable, activa, created_at, updated_at) VALUES
(1, 16, 'Categoría 1', 'multas', '510001', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 14, 'Categoría 2', 'consumo', '510002', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 6, 'Categoría 3', 'consumo', '510003', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 11, 'Categoría 4', 'extraordinario', '510004', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 14, 'Categoría 5', 'consumo', '510005', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 20, 'Categoría 6', 'operacional', '510006', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 16, 'Categoría 7', 'multas', '510007', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 20, 'Categoría 8', 'operacional', '510008', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 7, 'Categoría 9', 'fondo_reserva', '510009', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 3, 'Categoría 10', 'consumo', '510010', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 6, 'Categoría 11', 'multas', '510011', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 7, 'Categoría 12', 'fondo_reserva', '510012', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 7, 'Categoría 13', 'operacional', '510013', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 8, 'Categoría 14', 'operacional', '510014', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 6, 'Categoría 15', 'fondo_reserva', '510015', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 19, 'Categoría 16', 'consumo', '510016', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 11, 'Categoría 17', 'extraordinario', '510017', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 9, 'Categoría 18', 'operacional', '510018', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 5, 'Categoría 19', 'multas', '510019', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 13, 'Categoría 20', 'extraordinario', '510020', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `centro_costo` (id, comunidad_id, nombre, codigo, created_at, updated_at) VALUES
(1, 2, 'Centro 1', 'CC001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 3, 'Centro 2', 'CC002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 17, 'Centro 3', 'CC003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 9, 'Centro 4', 'CC004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 15, 'Centro 5', 'CC005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 11, 'Centro 6', 'CC006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 'Centro 7', 'CC007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 2, 'Centro 8', 'CC008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 19, 'Centro 9', 'CC009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 3, 'Centro 10', 'CC010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 17, 'Centro 11', 'CC011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 17, 'Centro 12', 'CC012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 13, 'Centro 13', 'CC013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 20, 'Centro 14', 'CC014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 6, 'Centro 15', 'CC015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 10, 'Centro 16', 'CC016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 5, 'Centro 17', 'CC017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 20, 'Centro 18', 'CC018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 7, 'Centro 19', 'CC019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 7, 'Centro 20', 'CC020', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `documento_compra` (id, comunidad_id, proveedor_id, tipo_doc, folio, fecha_emision, neto, iva, exento, total, glosa, created_at, updated_at) VALUES
(1, 12, 13, 'factura', '6736', '2025-05-24 00:00:00', 251654, 47814, 0, 299468, 'Compra de servicios 1', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 15, 15, 'boleta', '1657', '2025-01-28 00:00:00', 167918, 31904, 0, 199822, 'Compra de servicios 2', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 17, 15, 'boleta', '1303', '2025-04-07 00:00:00', 63268, 12020, 0, 75288, 'Compra de servicios 3', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 6, 20, 'factura', '4358', '2025-01-02 00:00:00', 242317, 46040, 0, 288357, 'Compra de servicios 4', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 8, 20, 'factura', '6620', '2025-05-29 00:00:00', 86610, 16455, 0, 103065, 'Compra de servicios 5', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 13, 5, 'boleta', '3679', '2024-10-16 00:00:00', 175225, 33292, 0, 208517, 'Compra de servicios 6', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 4, 'factura', '7900', '2025-01-13 00:00:00', 128139, 24346, 0, 152485, 'Compra de servicios 7', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 11, 4, 'factura', '5642', '2025-08-28 00:00:00', 94042, 17867, 0, 111909, 'Compra de servicios 8', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 1, 20, 'boleta', '1360', '2024-10-14 00:00:00', 157910, 30002, 0, 187912, 'Compra de servicios 9', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 4, 3, 'factura', '1851', '2024-10-01 00:00:00', 77420, 14709, 0, 92129, 'Compra de servicios 10', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 14, 7, 'factura', '5340', '2024-11-02 00:00:00', 228572, 43428, 0, 272000, 'Compra de servicios 11', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 19, 14, 'boleta', '8730', '2025-07-09 00:00:00', 184382, 35032, 0, 219414, 'Compra de servicios 12', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 9, 13, 'boleta', '7256', '2025-04-23 00:00:00', 141311, 26849, 0, 168160, 'Compra de servicios 13', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 3, 13, 'boleta', '3529', '2025-08-08 00:00:00', 70274, 13352, 0, 83626, 'Compra de servicios 14', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 14, 6, 'factura', '2355', '2024-11-08 00:00:00', 140925, 26775, 0, 167700, 'Compra de servicios 15', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 11, 20, 'factura', '9673', '2024-12-17 00:00:00', 244206, 46399, 0, 290605, 'Compra de servicios 16', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 7, 16, 'boleta', '3630', '2024-10-09 00:00:00', 130343, 24765, 0, 155108, 'Compra de servicios 17', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 15, 12, 'boleta', '3095', '2025-07-17 00:00:00', 235971, 44834, 0, 280805, 'Compra de servicios 18', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 2, 11, 'boleta', '2352', '2025-05-14 00:00:00', 130337, 24764, 0, 155101, 'Compra de servicios 19', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 20, 10, 'factura', '8298', '2025-03-31 00:00:00', 63465, 12058, 0, 75523, 'Compra de servicios 20', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `gasto` (id, comunidad_id, categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario, created_at, updated_at) VALUES
(1, 20, 9, 1, 1, '2025-10-01 00:00:00', 460806, 'Gasto operativo 1', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 2, 10, 5, 2, '2025-10-01 00:00:00', 250548, 'Gasto operativo 2', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 10, 18, 9, 3, '2025-10-01 00:00:00', 182753, 'Gasto operativo 3', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 11, 17, 14, 4, '2025-10-01 00:00:00', 332847, 'Gasto operativo 4', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 12, 2, 7, 5, '2025-10-01 00:00:00', 303912, 'Gasto operativo 5', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 12, 14, 2, 6, '2025-10-01 00:00:00', 491463, 'Gasto operativo 6', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 13, 18, 11, 7, '2025-10-01 00:00:00', 299520, 'Gasto operativo 7', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 8, 7, 7, 8, '2025-10-01 00:00:00', 149611, 'Gasto operativo 8', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 9, 18, 20, 9, '2025-10-01 00:00:00', 117620, 'Gasto operativo 9', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 6, 16, 8, 10, '2025-10-01 00:00:00', 204326, 'Gasto operativo 10', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 10, 12, 8, 11, '2025-10-01 00:00:00', 447698, 'Gasto operativo 11', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 2, 18, 9, 12, '2025-10-01 00:00:00', 206278, 'Gasto operativo 12', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 10, 10, 12, 13, '2025-10-01 00:00:00', 326563, 'Gasto operativo 13', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 8, 1, 10, 14, '2025-10-01 00:00:00', 476939, 'Gasto operativo 14', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 13, 9, 18, 15, '2025-10-01 00:00:00', 95295, 'Gasto operativo 15', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 3, 7, 11, 16, '2025-10-01 00:00:00', 194714, 'Gasto operativo 16', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 16, 9, 11, 17, '2025-10-01 00:00:00', 311874, 'Gasto operativo 17', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 18, 19, 11, 18, '2025-10-01 00:00:00', 193184, 'Gasto operativo 18', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 16, 1, 3, 19, '2025-10-01 00:00:00', 245664, 'Gasto operativo 19', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 2, 20, 8, 20, '2025-10-01 00:00:00', 433279, 'Gasto operativo 20', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

INSERT INTO `emision_gastos_comunes` (id, comunidad_id, periodo, fecha_vencimiento, estado, observaciones, created_at, updated_at) VALUES
(1, 15, '2025-01', '2025-01-25 19:03:07', 'emitido', 'Emisión GC comunidad 15, periodo 2025-01', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(2, 12, '2025-03', '2025-03-25 19:03:07', 'emitido', 'Emisión GC comunidad 12, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(3, 6, '2024-12', '2024-12-25 19:03:07', 'borrador', 'Emisión GC comunidad 6, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(4, 3, '2025-02', '2025-02-25 19:03:07', 'borrador', 'Emisión GC comunidad 3, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(5, 10, '2025-02', '2025-02-25 19:03:07', 'cerrado', 'Emisión GC comunidad 10, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(6, 1, '2025-09', '2025-09-25 19:03:07', 'borrador', 'Emisión GC comunidad 1, periodo 2025-09', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(7, 14, '2024-12', '2024-12-25 19:03:07', 'cerrado', 'Emisión GC comunidad 14, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(8, 10, '2024-12', '2024-12-25 19:03:07', 'emitido', 'Emisión GC comunidad 10, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(9, 18, '2025-10', '2025-10-25 19:03:07', 'emitido', 'Emisión GC comunidad 18, periodo 2025-10', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(10, 8, '2025-02', '2025-02-25 19:03:07', 'emitido', 'Emisión GC comunidad 8, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(11, 1, '2025-06', '2025-06-25 19:03:07', 'emitido', 'Emisión GC comunidad 1, periodo 2025-06', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(12, 14, '2025-08', '2025-08-25 19:03:07', 'borrador', 'Emisión GC comunidad 14, periodo 2025-08', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(13, 14, '2025-04', '2025-04-25 19:03:07', 'borrador', 'Emisión GC comunidad 14, periodo 2025-04', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(14, 16, '2025-03', '2025-03-25 19:03:07', 'emitido', 'Emisión GC comunidad 16, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(15, 10, '2025-10', '2025-10-25 19:03:07', 'cerrado', 'Emisión GC comunidad 10, periodo 2025-10', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(16, 3, '2025-07', '2025-07-25 19:03:07', 'emitido', 'Emisión GC comunidad 3, periodo 2025-07', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(17, 1, '2024-12', '2024-12-25 19:03:07', 'cerrado', 'Emisión GC comunidad 1, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(18, 20, '2025-03', '2025-03-25 19:03:07', 'borrador', 'Emisión GC comunidad 20, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(19, 2, '2025-04', '2025-04-25 19:03:07', 'borrador', 'Emisión GC comunidad 2, periodo 2025-04', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(20, 7, '2025-08', '2025-08-25 19:03:07', 'emitido', 'Emisión GC comunidad 7, periodo 2025-08', '2025-10-02 19:03:07', '2025-10-02 19:03:07');


INSERT INTO `cuenta_cobro_unidad` (id, emision_id, comunidad_id, unidad_id, monto_total, saldo, estado, interes_acumulado, created_at, updated_at) VALUES
(1, 15, 12, 10, 63292, 21108.27, 'pagado', 2554.14, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 17, 9, 12, 133550, 29706.09, 'pagado', 3896.02, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 8, 10, 3, 76354, 29990.36, 'vencido', 742.51, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 11, 10, 9, 114512, 114240.48, 'vencido', 808.1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 6, 11, 18, 109843, 88458.11, 'vencido', 4708.44, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 17, 6, 10, 116198, 85386.59, 'vencido', 2776.15, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 17, 2, 12, 119183, 35370.51, 'vencido', 1134.76, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 11, 9, 116769, 107915.67, 'pendiente', 2498.04, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 6, 10, 8, 143831, 91550.05, 'pendiente', 1556.19, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 17, 19, 20, 71667, 18917.64, 'pendiente', 41.7, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 18, 16, 13, 83194, 65086.39, 'pendiente', 1067.18, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 13, 5, 15, 132692, 16576.22, 'parcial', 4261.58, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 8, 16, 1, 145107, 73559.21, 'vencido', 3677.99, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 2, 20, 51079, 22114.73, 'pagado', 2384.07, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 16, 6, 8, 112169, 52713.49, 'pendiente', 124.75, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 1, 2, 15, 93793, 47761.7, 'parcial', 4354.75, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 18, 11, 12, 133757, 77169.94, 'vencido', 1539.94, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 14, 13, 86820, 55728.48, 'parcial', 4104.05, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 17, 9, 7, 134807, 74813.79, 'parcial', 3713.13, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 1, 20, 55523, 50727.97, 'pendiente', 2505.81, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

INSERT INTO `detalle_cuenta_unidad` (id, cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, origen_id, iva_incluido, created_at, updated_at) VALUES
(1, 1, 19, 'Detalle gasto 1', 36207, 'gasto', 8, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 2, 3, 'Detalle gasto 2', 30153, 'consumo', 1, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 3, 3, 'Detalle gasto 3', 46011, 'multa', 5, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 4, 3, 'Detalle gasto 4', 38502, 'gasto', 12, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 5, 7, 'Detalle gasto 5', 36010, 'multa', 11, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 6, 10, 'Detalle gasto 6', 23202, 'gasto', 6, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 7, 12, 'Detalle gasto 7', 14552, 'consumo', 4, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 3, 'Detalle gasto 8', 29917, 'gasto', 11, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 9, 4, 'Detalle gasto 9', 16099, 'multa', 7, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 10, 14, 'Detalle gasto 10', 22823, 'multa', 6, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 11, 10, 'Detalle gasto 11', 26696, 'multa', 7, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 12, 2, 'Detalle gasto 12', 29570, 'consumo', 11, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 13, 17, 'Detalle gasto 13', 20408, 'gasto', 18, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 7, 'Detalle gasto 14', 23192, 'gasto', 1, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 15, 8, 'Detalle gasto 15', 47887, 'multa', 5, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 16, 12, 'Detalle gasto 16', 49291, 'consumo', 15, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 17, 4, 'Detalle gasto 17', 40765, 'multa', 16, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 18, 'Detalle gasto 18', 22567, 'multa', 14, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 19, 9, 'Detalle gasto 19', 16596, 'consumo', 10, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 12, 'Detalle gasto 20', 19810, 'consumo', 2, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

INSERT INTO `multa` (id, comunidad_id, unidad_id, persona_id, motivo, descripcion, monto, estado, fecha, fecha_pago, created_at, updated_at) VALUES
(1, 7, 7, 5, 'Infracción 1', 'Descripción de la multa 1', 47953, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(2, 17, 6, 18, 'Infracción 2', 'Descripción de la multa 2', 28418, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(3, 15, 9, 7, 'Infracción 3', 'Descripción de la multa 3', 33945, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(4, 9, 5, 2, 'Infracción 4', 'Descripción de la multa 4', 40177, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(5, 3, 16, 14, 'Infracción 5', 'Descripción de la multa 5', 41843, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(6, 4, 6, 6, 'Infracción 6', 'Descripción de la multa 6', 18771, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(7, 13, 2, 15, 'Infracción 7', 'Descripción de la multa 7', 39377, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(8, 16, 6, 19, 'Infracción 8', 'Descripción de la multa 8', 10075, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(9, 16, 19, 8, 'Infracción 9', 'Descripción de la multa 9', 52550, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(10, 12, 10, 11, 'Infracción 10', 'Descripción de la multa 10', 22113, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(11, 12, 4, 9, 'Infracción 11', 'Descripción de la multa 11', 48335, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(12, 5, 16, 15, 'Infracción 12', 'Descripción de la multa 12', 51374, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(13, 9, 10, 3, 'Infracción 13', 'Descripción de la multa 13', 44744, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(14, 20, 3, 8, 'Infracción 14', 'Descripción de la multa 14', 40828, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(15, 2, 9, 1, 'Infracción 15', 'Descripción de la multa 15', 58139, 'anulada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(16, 9, 20, 4, 'Infracción 16', 'Descripción de la multa 16', 10983, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(17, 14, 14, 15, 'Infracción 17', 'Descripción de la multa 17', 45808, 'pendiente', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(18, 20, 16, 13, 'Infracción 18', 'Descripción de la multa 18', 56897, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(19, 20, 19, 20, 'Infracción 19', 'Descripción de la multa 19', 14663, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(20, 3, 15, 12, 'Infracción 20', 'Descripción de la multa 20', 24043, 'pagada', '2025-10-01 00:00:00', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09');

INSERT INTO `pago` (id, comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia, estado, comprobante_num, created_at, updated_at) VALUES
(1, 10, 2, 11, '2025-10-01 00:00:00', 41176, 'webpay', 'REF-3506', 'aplicado', 'COMP-8427', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(2, 20, 12, 3, '2025-10-01 00:00:00', 91068, 'efectivo', 'REF-2153', 'aplicado', 'COMP-1542', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(3, 13, 2, 2, '2025-10-01 00:00:00', 21663, 'transferencia', 'REF-5788', 'aplicado', 'COMP-8853', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(4, 6, 5, 2, '2025-10-01 00:00:00', 77031, 'webpay', 'REF-8059', 'pendiente', 'COMP-5875', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(5, 15, 16, 14, '2025-10-01 00:00:00', 76873, 'transferencia', 'REF-5265', 'pendiente', 'COMP-4693', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(6, 1, 6, 10, '2025-10-01 00:00:00', 24414, 'transferencia', 'REF-9764', 'aplicado', 'COMP-7613', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(7, 1, 11, 15, '2025-10-01 00:00:00', 63021, 'webpay', 'REF-7365', 'aplicado', 'COMP-5348', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(8, 18, 18, 13, '2025-10-01 00:00:00', 85989, 'webpay', 'REF-1829', 'aplicado', 'COMP-3484', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(9, 1, 18, 2, '2025-10-01 00:00:00', 76226, 'transferencia', 'REF-4926', 'aplicado', 'COMP-4976', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(10, 12, 17, 17, '2025-10-01 00:00:00', 70871, 'efectivo', 'REF-3537', 'aplicado', 'COMP-4270', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(11, 13, 18, 6, '2025-10-01 00:00:00', 45092, 'webpay', 'REF-9479', 'pendiente', 'COMP-6868', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(12, 3, 18, 18, '2025-10-01 00:00:00', 81221, 'webpay', 'REF-8996', 'pendiente', 'COMP-7382', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(13, 20, 8, 20, '2025-10-01 00:00:00', 71392, 'transferencia', 'REF-1194', 'pendiente', 'COMP-4345', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(14, 13, 10, 1, '2025-10-01 00:00:00', 30685, 'transferencia', 'REF-4496', 'pendiente', 'COMP-4496', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(15, 5, 12, 17, '2025-10-01 00:00:00', 88339, 'efectivo', 'REF-9485', 'aplicado', 'COMP-6243', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(16, 11, 19, 4, '2025-10-01 00:00:00', 92283, 'efectivo', 'REF-1708', 'aplicado', 'COMP-6649', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(17, 7, 4, 17, '2025-10-01 00:00:00', 89551, 'transferencia', 'REF-4881', 'aplicado', 'COMP-7680', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(18, 17, 4, 18, '2025-10-01 00:00:00', 31263, 'transferencia', 'REF-8889', 'pendiente', 'COMP-8149', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(19, 16, 13, 3, '2025-10-01 00:00:00', 68743, 'webpay', 'REF-9784', 'pendiente', 'COMP-5236', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(20, 11, 5, 3, '2025-10-01 00:00:00', 40810, 'efectivo', 'REF-4823', 'aplicado', 'COMP-6990', '2025-10-02 18:21:25', '2025-10-02 18:21:25');

INSERT INTO `pago_aplicacion` (id, pago_id, cuenta_cobro_unidad_id, monto, prioridad, created_at, updated_at) VALUES
(1, 1, 12, 17058, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 2, 4, 26657, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 3, 11, 11616, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 4, 10, 28547, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 5, 2, 15755, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 6, 20, 21222, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 7, 8, 23990, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 19, 22286, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 9, 9, 29346, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 10, 18, 12559, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 11, 6, 13010, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 12, 3, 21486, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 13, 15, 17365, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 18, 20455, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 15, 19, 29705, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 16, 17, 11455, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 17, 9, 22339, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 20, 24222, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 19, 6, 11392, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 9, 17829, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

INSERT INTO `rol` (id, codigo, nombre, descripcion, nivel_acceso, es_rol_sistema, created_at) VALUES
(1, 'superadmin', 'Superadmin', 'Acceso total a toda la plataforma', 100, 1, '2025-10-02 18:53:13'),
(2, 'admin_comunidad', 'Admin Comunidad', 'Administrador de una comunidad específica', 80, 0, '2025-10-02 18:53:13'),
(3, 'conserje', 'Conserje', 'Registro de eventos, visitas y bitácoras', 50, 0, '2025-10-02 18:53:13'),
(4, 'contador', 'Contador', 'Gestión financiera y de gastos comunes', 70, 0, '2025-10-02 18:53:13'),
(5, 'proveedor_servicio', 'Proveedor Servicio', 'Emisión de documentos de compra', 30, 0, '2025-10-02 18:53:13'),
(6, 'residente', 'Residente', 'Acceso a pagos, reservas y notificaciones', 10, 0, '2025-10-02 18:53:13'),
(7, 'propietario', 'Propietario', 'Dueño de una unidad habitacional', 20, 0, '2025-10-02 18:53:13'),
(8, 'inquilino', 'Inquilino', 'Arrendatario registrado', 15, 0, '2025-10-02 18:53:13'),
(9, 'auditor_externo', 'Auditor Externo', 'Acceso de solo lectura a informes', 40, 1, '2025-10-02 18:53:13'),
(10, 'soporte_tecnico', 'Soporte Tecnico', 'Soporte técnico interno', 90, 1, '2025-10-02 18:53:13'),
(11, 'tesorero', 'Tesorero', 'Gestión de cobros y cuentas', 60, 0, '2025-10-02 18:53:13'),
(12, 'moderador_comunidad', 'Moderador Comunidad', 'Modera eventos y publicaciones', 35, 0, '2025-10-02 18:53:13'),
(13, 'secretario', 'Secretario', 'Apoyo documental y comunicacional', 25, 0, '2025-10-02 18:53:13'),
(14, 'presidente_comite', 'Presidente Comite', 'Lidera el comité de administración', 85, 0, '2025-10-02 18:53:13'),
(15, 'revisor_cuentas', 'Revisor Cuentas', 'Revisión de balances y movimientos', 45, 0, '2025-10-02 18:53:13'),
(16, 'coordinador_reservas', 'Coordinador Reservas', 'Gestión de amenidades comunes', 20, 0, '2025-10-02 18:53:13'),
(17, 'sindico', 'Sindico', 'Rol legal según reglamento', 75, 0, '2025-10-02 18:53:13'),
(18, 'admin_externo', 'Admin Externo', 'Administrador contratado', 70, 1, '2025-10-02 18:53:13'),
(19, 'visitante_autorizado', 'Visitante Autorizado', 'Acceso temporal', 5, 0, '2025-10-02 18:53:13'),
(20, 'sistema', 'Sistema', 'Acciones automáticas del sistema', 100, 1, '2025-10-02 18:53:13');


-- *********************************************************************************
-- Índices, Claves y Restricciones CORREGIDAS
-- Se eliminaron las redefiniciones de PRIMARY KEY que causaban el error.
-- *********************************************************************************

-- Indexes for table `amenidad`
ALTER TABLE `amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_amenidad_comunidad` (`comunidad_id`),
  ADD KEY `idx_comunidad_id` (`comunidad_id`);

-- Indexes for table `archivos`
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comunidad_entity` (`comunidad_id`,`entity_type`,`entity_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_uploaded_at` (`uploaded_at`);

-- Indexes for table `auditoria`
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_usuario` (`usuario_id`),
  ADD KEY `ix_audit_tabla` (`tabla`,`registro_id`),
  ADD KEY `ix_audit_fecha` (`created_at`),
  ADD KEY `ix_auditoria_accion` (`accion`),
  ADD KEY `ix_auditoria_usuario_fecha` (`usuario_id`,`created_at`);

-- Indexes for table `categoria_gasto`
ALTER TABLE `categoria_gasto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_catgasto_nombre` (`comunidad_id`,`nombre`);

-- Indexes for table `centro_costo`
ALTER TABLE `centro_costo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ccosto_codigo` (`comunidad_id`,`codigo`);

-- Indexes for table `comunidad`
ALTER TABLE `comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_comunidad_rut` (`rut`,`dv`);

-- Indexes for table `conciliacion_bancaria`
ALTER TABLE `conciliacion_bancaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_conc_comunidad` (`comunidad_id`),
  ADD KEY `fk_conc_pago` (`pago_id`);

-- Indexes for table `configuracion_interes`
ALTER TABLE `configuracion_interes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_cint_comunidad` (`comunidad_id`);

-- Indexes for table `cuenta_cobro_unidad`
ALTER TABLE `cuenta_cobro_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargo_emision` (`emision_id`),
  ADD KEY `fk_cargo_comunidad` (`comunidad_id`),
  ADD KEY `ix_cargo_unidad` (`unidad_id`),
  ADD KEY `ix_cargo_estado` (`estado`);

-- Indexes for table `detalle_cuenta_unidad`
ALTER TABLE `detalle_cuenta_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargodet_categoria` (`categoria_id`),
  ADD KEY `ix_cargodet_cargo` (`cuenta_cobro_unidad_id`);

-- Indexes for table `detalle_emision_gastos`
ALTER TABLE `detalle_emision_gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_emidet_gasto` (`gasto_id`),
  ADD KEY `fk_emidet_categoria` (`categoria_id`),
  ADD KEY `ix_emidet_emision` (`emision_id`);

-- Indexes for table `documento_compra`
ALTER TABLE `documento_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_doc_compra` (`comunidad_id`,`proveedor_id`,`tipo_doc`,`folio`),
  ADD KEY `fk_doc_comunidad` (`comunidad_id`),
  ADD KEY `ix_doc_proveedor` (`proveedor_id`);

-- Indexes for table `documento_comunidad`
ALTER TABLE `documento_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_docrepo_comunidad` (`comunidad_id`);

-- Indexes for table `edificio`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `edificio`
  ADD KEY `ix_edificio_comunidad` (`comunidad_id`);

-- Indexes for table `emision_gastos_comunes`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `emision_gastos_comunes`
  ADD UNIQUE KEY `uq_emision_periodo` (`comunidad_id`,`periodo`);

-- Indexes for table `gasto`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `gasto`
  ADD KEY `fk_gasto_comunidad` (`comunidad_id`),
  ADD KEY `fk_gasto_ccosto` (`centro_costo_id`),
  ADD KEY `fk_gasto_doc` (`documento_compra_id`),
  ADD KEY `ix_gasto_categoria` (`categoria_id`);

-- Indexes for table `lectura_medidor`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `lectura_medidor`
  ADD UNIQUE KEY `uq_lectura_periodo` (`medidor_id`,`periodo`),
  ADD KEY `ix_lectura_medidor` (`medidor_id`);

-- Indexes for table `medidor`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `medidor`
  ADD UNIQUE KEY `uq_medidor_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `fk_medidor_unidad` (`unidad_id`);

-- Indexes for table `multa`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `multa`
  ADD KEY `fk_multa_comunidad` (`comunidad_id`),
  ADD KEY `fk_multa_unidad` (`unidad_id`),
  ADD KEY `fk_multa_persona` (`persona_id`),
  ADD KEY `ix_multa_estado` (`estado`);

-- Indexes for table `notificacion_usuario`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `notificacion_usuario`
  ADD KEY `fk_notif_comunidad` (`comunidad_id`),
  ADD KEY `fk_notif_persona` (`persona_id`),
  ADD KEY `ix_notif_persona_leida` (`persona_id`,`leida`);

-- Indexes for table `pago`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `pago`
  ADD KEY `fk_pago_comunidad` (`comunidad_id`),
  ADD KEY `fk_pago_unidad` (`unidad_id`),
  ADD KEY `fk_pago_persona` (`persona_id`),
  ADD KEY `ix_pago_fecha` (`fecha`),
  ADD KEY `ix_pago_comunidad_fecha` (`comunidad_id`,`fecha`),
  ADD KEY `ix_pago_comunidad_estado` (`comunidad_id`,`estado`);

-- Indexes for table `pago_aplicacion`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `pago_aplicacion`
  ADD UNIQUE KEY `uq_papp` (`pago_id`,`cuenta_cobro_unidad_id`),
  ADD KEY `fk_papp_cargo` (`cuenta_cobro_unidad_id`),
  ADD KEY `ix_papp_pago` (`pago_id`);

-- Indexes for table `parametros_cobranza`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `parametros_cobranza`
  ADD UNIQUE KEY `comunidad_id` (`comunidad_id`);

-- Indexes for table `persona`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `persona`
  ADD UNIQUE KEY `uq_persona_rut` (`rut`,`dv`);

-- Indexes for table `proveedor`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `proveedor`
  ADD UNIQUE KEY `uq_proveedor_rut` (`comunidad_id`,`rut`,`dv`);

-- Indexes for table `registro_conserjeria`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `registro_conserjeria`
  ADD KEY `fk_bitacora_comunidad` (`comunidad_id`),
  ADD KEY `fk_regconser_usuario` (`usuario_id`);

-- Indexes for table `reserva_amenidad`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `reserva_amenidad`
  ADD KEY `fk_resa_comunidad` (`comunidad_id`),
  ADD KEY `fk_resa_amenidad` (`amenidad_id`),
  ADD KEY `fk_resa_unidad` (`unidad_id`),
  ADD KEY `fk_resa_persona` (`persona_id`),
  ADD KEY `ix_reserva_amenidad_rango` (`amenidad_id`,`inicio`,`fin`);

-- Indexes for table `rol_sistema`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `rol_sistema`
  ADD UNIQUE KEY `uq_rol_codigo` (`codigo`);

-- Indexes for table `sesion_usuario`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `sesion_usuario`
  ADD KEY `fk_sesion_usuario` (`usuario_id`),
  ADD KEY `ix_sesion_activity` (`last_activity`),
  ADD KEY `ix_sesion_usuario_created` (`created_at`);

-- Indexes for table `tarifa_consumo`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `tarifa_consumo`
  ADD KEY `ix_tarifa_comunidad` (`comunidad_id`);

-- Indexes for table `ticket_soporte`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `ticket_soporte`
  ADD KEY `fk_ticket_comunidad` (`comunidad_id`),
  ADD KEY `fk_ticket_unidad` (`unidad_id`),
  ADD KEY `fk_solsoporte_asignado` (`asignado_a`);

-- Indexes for table `titulares_unidad`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `titulares_unidad`
  ADD KEY `fk_tenencia_comunidad` (`comunidad_id`),
  ADD KEY `ix_tenencia_unidad` (`unidad_id`),
  ADD KEY `ix_tenencia_persona` (`persona_id`);

-- Indexes for table `torre`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `torre`
  ADD KEY `ix_torre_edificio` (`edificio_id`);

-- Indexes for table `uf_valor`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `uf_valor`
  ADD PRIMARY KEY (`fecha`);

-- Indexes for table `unidad`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `unidad`
  ADD UNIQUE KEY `uq_unidad_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `ix_unidad_comunidad` (`comunidad_id`),
  ADD KEY `ix_unidad_edificio` (`edificio_id`),
  ADD KEY `ix_unidad_torre` (`torre_id`);

-- Indexes for table `user_preferences`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `user_preferences`
  ADD UNIQUE KEY `unique_user_preferences` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

-- Indexes for table `usuario`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `usuario`
  ADD UNIQUE KEY `uq_usuario_username` (`username`),
  ADD KEY `fk_usuario_persona` (`persona_id`);

-- Indexes for table `usuario_rol_comunidad`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `usuario_rol_comunidad`
  ADD UNIQUE KEY `uq_usuario_comunidad_rol_activo` (`usuario_id`,`comunidad_id`,`rol_id`,`activo`),
  ADD KEY `fk_ucr_usuario` (`usuario_id`),
  ADD KEY `fk_ucr_comunidad` (`comunidad_id`),
  ADD KEY `fk_ucr_rol` (`rol_id`),
  ADD KEY `ix_ucr_activo` (`activo`);

-- Indexes for table `utm_valor`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `utm_valor`
  ADD PRIMARY KEY (`fecha`);

-- Indexes for table `webhook_pago`
  -- PK is usually defined in CREATE TABLE, removed here to prevent duplication.
ALTER TABLE `webhook_pago`
  ADD KEY `fk_wh_comunidad` (`comunidad_id`),
  ADD KEY `fk_wh_pago` (`pago_id`);
-- Cuentas Claras 2.0 - Esquema MySQL (OLTP 3FN)
-- Requiere MySQL 8.0+

-- 0) Inicialización de base de datos
CREATE DATABASE IF NOT EXISTS cuentasclaras CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE cuentasclaras;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 1) Utilidades
CREATE TABLE IF NOT EXISTS uf_valor (
  fecha DATE PRIMARY KEY,
  valor DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS utm_valor (
  fecha DATE PRIMARY KEY,
  valor DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

-- 2) Núcleo de comunidades y unidades
CREATE TABLE IF NOT EXISTS comunidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  razon_social VARCHAR(200) NOT NULL,
  rut VARCHAR(12) NOT NULL,
  dv CHAR(1) NOT NULL,
  giro VARCHAR(200) NULL,
  direccion VARCHAR(250) NULL,
  email_contacto VARCHAR(150) NULL,
  telefono_contacto VARCHAR(50) NULL,
  politica_mora_json JSON NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'CLP',
  tz VARCHAR(50) NOT NULL DEFAULT 'America/Santiago',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  CONSTRAINT uq_comunidad_rut UNIQUE (rut, dv)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS edificio (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(250) NULL,
  codigo VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_edificio_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  INDEX ix_edificio_comunidad (comunidad_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS torre (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  edificio_id BIGINT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_torre_edificio FOREIGN KEY (edificio_id) REFERENCES edificio(id) ON DELETE RESTRICT,
  INDEX ix_torre_edificio (edificio_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS unidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  edificio_id BIGINT NULL,
  torre_id BIGINT NULL,
  codigo VARCHAR(50) NOT NULL,
  alicuota DECIMAL(8,6) NOT NULL DEFAULT 0,
  m2_utiles DECIMAL(10,2) NULL,
  m2_terrazas DECIMAL(10,2) NULL,
  nro_bodega VARCHAR(50) NULL,
  nro_estacionamiento VARCHAR(50) NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_unidad_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_unidad_edificio FOREIGN KEY (edificio_id) REFERENCES edificio(id) ON DELETE RESTRICT,
  CONSTRAINT fk_unidad_torre FOREIGN KEY (torre_id) REFERENCES torre(id) ON DELETE RESTRICT,
  CONSTRAINT uq_unidad_codigo UNIQUE (comunidad_id, codigo),
  CONSTRAINT ck_unidad_loc CHECK ((edificio_id IS NOT NULL) XOR (torre_id IS NOT NULL)),
  INDEX ix_unidad_comunidad (comunidad_id),
  INDEX ix_unidad_edificio (edificio_id),
  INDEX ix_unidad_torre (torre_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS persona (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rut VARCHAR(12) NOT NULL,
  dv CHAR(1) NOT NULL,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  email VARCHAR(150) NULL,
  telefono VARCHAR(50) NULL,
  direccion VARCHAR(250) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_persona_rut UNIQUE (rut, dv)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  persona_id BIGINT NULL,
  username VARCHAR(80) NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  email VARCHAR(150) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE SET NULL,
  CONSTRAINT uq_usuario_username UNIQUE (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS membresia_comunidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  persona_id BIGINT NOT NULL,
  rol ENUM('admin','comite','conserje','contador','residente','propietario') NOT NULL,
  desde DATE NOT NULL,
  hasta DATE NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_memb_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_memb_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_membresia (comunidad_id, persona_id, rol, desde),
  INDEX ix_memb_comunidad (comunidad_id),
  INDEX ix_memb_persona (persona_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenencia_unidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NOT NULL,
  persona_id BIGINT NOT NULL,
  tipo ENUM('propietario','arrendatario') NOT NULL,
  desde DATE NOT NULL,
  hasta DATE NULL,
  porcentaje DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenencia_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tenencia_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tenencia_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE RESTRICT,
  INDEX ix_tenencia_unidad (unidad_id),
  INDEX ix_tenencia_persona (persona_id)
) ENGINE=InnoDB;

-- 3) Catálogos y configuración
CREATE TABLE IF NOT EXISTS categoria_gasto (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  tipo ENUM('operacional','extraordinario','fondo_reserva','multas','consumo') NOT NULL,
  cta_contable VARCHAR(50) NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catgasto_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT uq_catgasto_nombre UNIQUE (comunidad_id, nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS centro_costo (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ccosto_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT uq_ccosto_codigo UNIQUE (comunidad_id, codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  rut VARCHAR(12) NOT NULL,
  dv CHAR(1) NOT NULL,
  razon_social VARCHAR(200) NOT NULL,
  giro VARCHAR(200) NULL,
  email VARCHAR(150) NULL,
  telefono VARCHAR(50) NULL,
  direccion VARCHAR(250) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prov_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT uq_proveedor_rut UNIQUE (comunidad_id, rut, dv)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parametros_cobranza (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL UNIQUE,
  dias_gracia INT NOT NULL DEFAULT 0,
  tasa_mora_mensual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  mora_calculo ENUM('diaria','mensual') NOT NULL DEFAULT 'mensual',
  redondeo ENUM('arriba','normal','abajo') NOT NULL DEFAULT 'normal',
  interes_max_mensual DECIMAL(5,2) NULL,
  aplica_interes_sobre ENUM('saldo','capital') NOT NULL DEFAULT 'saldo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_paramcobr_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4) Gastos, emisiones y cargos
CREATE TABLE IF NOT EXISTS documento_compra (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  proveedor_id BIGINT NOT NULL,
  tipo_doc ENUM('factura','boleta','nota_credito') NOT NULL,
  folio VARCHAR(50) NOT NULL,
  fecha_emision DATE NOT NULL,
  neto DECIMAL(12,2) NOT NULL DEFAULT 0,
  iva DECIMAL(12,2) NOT NULL DEFAULT 0,
  exento DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  glosa VARCHAR(250) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_doc_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id) ON DELETE RESTRICT,
  INDEX ix_doc_proveedor (proveedor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gasto (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  categoria_id BIGINT NOT NULL,
  centro_costo_id BIGINT NULL,
  documento_compra_id BIGINT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  glosa VARCHAR(250) NULL,
  extraordinario TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gasto_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gasto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_gasto(id) ON DELETE RESTRICT,
  CONSTRAINT fk_gasto_ccosto FOREIGN KEY (centro_costo_id) REFERENCES centro_costo(id) ON DELETE SET NULL,
  CONSTRAINT fk_gasto_doc FOREIGN KEY (documento_compra_id) REFERENCES documento_compra(id) ON DELETE SET NULL,
  INDEX ix_gasto_categoria (categoria_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS emision_gasto_comun (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  periodo CHAR(7) NOT NULL, -- YYYY-MM
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('borrador','emitido','cerrado','anulado') NOT NULL DEFAULT 'borrador',
  observaciones VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emision_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT uq_emision_periodo UNIQUE (comunidad_id, periodo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS emision_gasto_detalle (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  emision_id BIGINT NOT NULL,
  gasto_id BIGINT NULL,
  categoria_id BIGINT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  regla_prorrateo ENUM('coeficiente','partes_iguales','consumo','fijo_por_unidad') NOT NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emidet_emision FOREIGN KEY (emision_id) REFERENCES emision_gasto_comun(id) ON DELETE CASCADE,
  CONSTRAINT fk_emidet_gasto FOREIGN KEY (gasto_id) REFERENCES gasto(id) ON DELETE SET NULL,
  CONSTRAINT fk_emidet_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_gasto(id) ON DELETE RESTRICT,
  INDEX ix_emidet_emision (emision_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cargo_unidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  emision_id BIGINT NOT NULL,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NOT NULL,
  monto_total DECIMAL(12,2) NOT NULL,
  saldo DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','pagado','vencido','parcial') NOT NULL DEFAULT 'pendiente',
  interes_acumulado DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cargo_emision FOREIGN KEY (emision_id) REFERENCES emision_gasto_comun(id) ON DELETE RESTRICT,
  CONSTRAINT fk_cargo_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_cargo_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE RESTRICT,
  INDEX ix_cargo_unidad (unidad_id),
  INDEX ix_cargo_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cargo_unidad_detalle (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cargo_unidad_id BIGINT NOT NULL,
  categoria_id BIGINT NOT NULL,
  glosa VARCHAR(250) NULL,
  monto DECIMAL(12,2) NOT NULL,
  origen ENUM('gasto','multa','consumo','ajuste') NOT NULL,
  origen_id BIGINT NULL,
  iva_incluido TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cargodet_cargo FOREIGN KEY (cargo_unidad_id) REFERENCES cargo_unidad(id) ON DELETE CASCADE,
  CONSTRAINT fk_cargodet_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_gasto(id) ON DELETE RESTRICT,
  INDEX ix_cargodet_cargo (cargo_unidad_id)
) ENGINE=InnoDB;

-- 5) Consumos
CREATE TABLE IF NOT EXISTS medidor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NULL,
  tipo ENUM('agua','gas','electricidad') NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  es_compartido TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medidor_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_medidor_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE SET NULL,
  CONSTRAINT uq_medidor_codigo UNIQUE (comunidad_id, codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lectura_medidor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  medidor_id BIGINT NOT NULL,
  fecha DATE NOT NULL,
  lectura DECIMAL(12,3) NOT NULL,
  periodo CHAR(7) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lectura_medidor FOREIGN KEY (medidor_id) REFERENCES medidor(id) ON DELETE CASCADE,
  CONSTRAINT uq_lectura_periodo UNIQUE (medidor_id, periodo),
  INDEX ix_lectura_medidor (medidor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tarifa_consumo (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  tipo ENUM('agua','gas','electricidad') NOT NULL,
  periodo_desde CHAR(7) NOT NULL,
  periodo_hasta CHAR(7) NULL,
  precio_por_unidad DECIMAL(12,6) NOT NULL DEFAULT 0,
  cargo_fijo DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarifa_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  INDEX ix_tarifa_comunidad (comunidad_id)
) ENGINE=InnoDB;

-- 6) Multas e intereses
CREATE TABLE IF NOT EXISTS multa (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NOT NULL,
  persona_id BIGINT NULL,
  motivo VARCHAR(120) NOT NULL,
  descripcion VARCHAR(500) NULL,
  monto DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente',
  fecha DATE NOT NULL,
  fecha_pago DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_multa_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_multa_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_multa_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE SET NULL,
  INDEX ix_multa_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS configuracion_interes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  aplica_desde DATE NOT NULL,
  tasa_mensual DECIMAL(5,2) NOT NULL,
  metodo ENUM('simple','compuesto') NOT NULL DEFAULT 'simple',
  tope_mensual DECIMAL(5,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cint_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  INDEX ix_cint_comunidad (comunidad_id)
) ENGINE=InnoDB;

-- 7) Cobranzas y pagos
CREATE TABLE IF NOT EXISTS pago (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NULL,
  persona_id BIGINT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  medio ENUM('transferencia','webpay','khipu','servipag','efectivo') NOT NULL,
  referencia VARCHAR(120) NULL,
  estado ENUM('pendiente','aplicado','reversado') NOT NULL DEFAULT 'pendiente',
  comprobante_num VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pago_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE SET NULL,
  CONSTRAINT fk_pago_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE SET NULL,
  INDEX ix_pago_fecha (fecha)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pago_aplicacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pago_id BIGINT NOT NULL,
  cargo_unidad_id BIGINT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  prioridad INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_papp_pago FOREIGN KEY (pago_id) REFERENCES pago(id) ON DELETE CASCADE,
  CONSTRAINT fk_papp_cargo FOREIGN KEY (cargo_unidad_id) REFERENCES cargo_unidad(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_papp (pago_id, cargo_unidad_id),
  INDEX ix_papp_pago (pago_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conciliacion_bancaria (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  fecha_mov DATE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  glosa VARCHAR(250) NULL,
  referencia VARCHAR(150) NULL,
  estado ENUM('pendiente','conciliado','descartado') NOT NULL DEFAULT 'pendiente',
  pago_id BIGINT NULL,
  extracto_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conc_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_conc_pago FOREIGN KEY (pago_id) REFERENCES pago(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS webhook_pago (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  proveedor ENUM('webpay','khipu','otro') NOT NULL,
  payload_json JSON NOT NULL,
  fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  procesado TINYINT(1) NOT NULL DEFAULT 0,
  pago_id BIGINT NULL,
  CONSTRAINT fk_wh_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_wh_pago FOREIGN KEY (pago_id) REFERENCES pago(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8) Operación y soporte
CREATE TABLE IF NOT EXISTS amenidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  reglas VARCHAR(500) NULL,
  capacidad INT NULL,
  requiere_aprobacion TINYINT(1) NOT NULL DEFAULT 0,
  tarifa DECIMAL(12,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_amenidad_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reserva_amenidad (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  amenidad_id BIGINT NOT NULL,
  unidad_id BIGINT NOT NULL,
  persona_id BIGINT NOT NULL,
  inicio DATETIME NOT NULL,
  fin DATETIME NOT NULL,
  estado ENUM('solicitada','aprobada','rechazada','cancelada','cumplida') NOT NULL DEFAULT 'solicitada',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resa_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_resa_amenidad FOREIGN KEY (amenidad_id) REFERENCES amenidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_resa_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_resa_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  unidad_id BIGINT NULL,
  categoria VARCHAR(120) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion VARCHAR(1000) NULL,
  estado ENUM('abierto','en_progreso','resuelto','cerrado') NOT NULL DEFAULT 'abierto',
  prioridad ENUM('baja','media','alta') NOT NULL DEFAULT 'media',
  asignado_a BIGINT NULL,
  attachments_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_unidad FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notificacion (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  persona_id BIGINT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje VARCHAR(1000) NOT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  objeto_tipo VARCHAR(50) NULL,
  objeto_id BIGINT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT,
  CONSTRAINT fk_notif_persona FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documento (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  tipo ENUM('circular','acta','reglamento','boletin','otro') NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  periodo CHAR(7) NULL,
  visibilidad ENUM('publico','privado') NOT NULL DEFAULT 'privado',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_docrepo_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bitacora_conserjeria (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  comunidad_id BIGINT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  usuario_id BIGINT NULL,
  evento VARCHAR(150) NOT NULL,
  detalle VARCHAR(1000) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bitacora_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

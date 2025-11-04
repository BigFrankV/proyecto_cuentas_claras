require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const comunidadRoutes = require('./routes/comunidades');
const edificioRoutes = require('./routes/edificios');
const unidadRoutes = require('./routes/unidades');
const personaRoutes = require('./routes/personas');
const torresRoutes = require('./routes/torres');
const membresiasRoutes = require('./routes/membresias');
const categoriasGastoRoutes = require('./routes/categoriasGasto');
const centrosCostoRoutes = require('./routes/centrosCosto');
const proveedoresRoutes = require('./routes/proveedores');
const documentosCompraRoutes = require('./routes/documentosCompra');
const gastosRoutes = require('./routes/gastos');
const emisionesRoutes = require('./routes/emisiones');
const cargosRoutes = require('./routes/cargos');
const pagosRoutes = require('./routes/pagos');
const prorrateoRoutes = require('./routes/prorrateo');
const medidoresRoutes = require('./routes/medidores');
const tarifasConsumoRoutes = require('./routes/tarifasConsumo');
const multasRoutes = require('./routes/multas');
const conciliacionesRoutes = require('./routes/conciliaciones');
const webhooksRoutes = require('./routes/webhooks');
const amenidadesRoutes = require('./routes/amenidades');
const soporteRoutes = require('./routes/soporte');
const utilRoutes = require('./routes/util');
const filesRoutes = require('./routes/files');
const valorUtmRoutes = require('./routes/valor_utm');
const dashboardRoutes = require('./routes/dashboard');
const reportesRoutes = require('./routes/reportes');
const notificacionesRoutes = require('./routes/notificaciones');
const ticketsRoutes = require('./routes/tickets');
const paymentGatewayRoutes = require('./routes/paymentGateway');
const consumosRoutes = require('./routes/consumos');
const sequelize = require('./sequelize');
const logger = require('./logger');
const { setupSwagger } = require('./swagger');
const apelacionesRouter = require('./routes/apelaciones');
const comprasRouter = require('./routes/compras');
const bitacoraRoutes = require('./routes/bitacora');

const app = express();

app.use(helmet());
// app.use(cors());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

setupSwagger(app);

// Register all routes
app.use('/auth', authRoutes);
app.use('/comunidades', comunidadRoutes);
app.use('/comunidad', comunidadRoutes); // Alias singular
app.use('/edificios', edificioRoutes);
app.use('/unidades', unidadRoutes);
app.use('/personas', personaRoutes);
app.use('/torres', torresRoutes);
app.use('/membresias', membresiasRoutes);
app.use('/categorias-gasto', categoriasGastoRoutes);
app.use('/centros-costo', centrosCostoRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/documentos-compra', documentosCompraRoutes);
app.use('/gastos', gastosRoutes);
app.use('/emisiones', emisionesRoutes);
app.use('/cargos', cargosRoutes);
app.use('/pagos', pagosRoutes);
app.use('/prorrateo', prorrateoRoutes);
app.use('/medidores', medidoresRoutes);
app.use('/tarifas-consumo', tarifasConsumoRoutes);
app.use('/multas', multasRoutes);
app.use('/conciliaciones', conciliacionesRoutes);
app.use('/consumos', consumosRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/amenidades', amenidadesRoutes);
app.use('/', soporteRoutes); // soporte exposes varios paths: tickets, notificaciones, documentos, bitacora, parametros
app.use('/util', utilRoutes);
app.use('/files', filesRoutes);
app.use('/api/valor-utm', valorUtmRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reportes', reportesRoutes);
app.use('/notificaciones', notificacionesRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/gateway', paymentGatewayRoutes);
app.use('/apelaciones', apelacionesRouter);
app.use('/compras', comprasRouter);
app.use('/bitacora', bitacoraRoutes);

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Sequelize connected');
  } catch (err) {
    logger.error(
      'Error al conectar con la base de datos: %s',
      err && err.message
    );
    if (process.env.SKIP_DB_CONNECT === 'true') {
      logger.warn(
        'SKIP_DB_CONNECT=true — continuando sin conexión a la base de datos (solo desarrollo)'
      );
    } else {
      process.exit(1);
    }
  }

  // Redis removed; skipping cache setup

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);

    // Inicializar scheduler de indicadores
    try {
      const schedulerService = require('./services/schedulerService');
      schedulerService.start();
      logger.info('Scheduler de indicadores iniciado');
    } catch (error) {
      logger.error('Error iniciando scheduler:', error);
    }
  });
}

// Solo inicia el servidor si no estamos en modo test
if (require.main === module) {
  start();
}

// Exportar app para tests
module.exports = app;

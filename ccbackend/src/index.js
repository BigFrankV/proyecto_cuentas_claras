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

const app = express();

app.use(helmet());
		// app.use(cors());
		app.use(cors({
			origin: 'http://localhost:5173',
			credentials: true
		}));
app.use(express.json());
app.use(morgan('dev'));

setupSwagger(app);

console.log('authRoutes type:', typeof authRoutes, 'is function?', typeof authRoutes === 'function');
app.use('/auth', authRoutes);
console.log('comunidadRoutes type:', typeof comunidadRoutes, 'is function?', typeof comunidadRoutes === 'function');
app.use('/comunidades', comunidadRoutes);
app.use('/comunidad', comunidadRoutes); // Alias singular
console.log('edificioRoutes type:', typeof edificioRoutes, 'is function?', typeof edificioRoutes === 'function');
app.use('/edificios', edificioRoutes);
console.log('unidadRoutes type:', typeof unidadRoutes, 'is function?', typeof unidadRoutes === 'function');
// Change the mount point from '/api/unidades' to '/unidades' to match frontend calls
app.use('/unidades', unidadRoutes);
console.log('personaRoutes type:', typeof personaRoutes, 'is function?', typeof personaRoutes === 'function');
app.use('/personas', personaRoutes);
console.log('torresRoutes type:', typeof torresRoutes, 'is function?', typeof torresRoutes === 'function');
app.use('/torres', torresRoutes);
console.log('membresiasRoutes type:', typeof membresiasRoutes, 'is function?', typeof membresiasRoutes === 'function');
app.use('/membresias', membresiasRoutes);
console.log('categoriasGastoRoutes type:', typeof categoriasGastoRoutes, 'is function?', typeof categoriasGastoRoutes === 'function');
app.use('/categorias-gasto', categoriasGastoRoutes);
console.log('centrosCostoRoutes type:', typeof centrosCostoRoutes, 'is function?', typeof centrosCostoRoutes === 'function');
app.use('/centros-costo', centrosCostoRoutes);
console.log('proveedoresRoutes type:', typeof proveedoresRoutes, 'is function?', typeof proveedoresRoutes === 'function');
app.use('/proveedores', proveedoresRoutes);
console.log('documentosCompraRoutes type:', typeof documentosCompraRoutes, 'is function?', typeof documentosCompraRoutes === 'function');
app.use('/documentos-compra', documentosCompraRoutes);
console.log('gastosRoutes type:', typeof gastosRoutes, 'is function?', typeof gastosRoutes === 'function');
app.use('/gastos', gastosRoutes);
console.log('emisionesRoutes type:', typeof emisionesRoutes, 'is function?', typeof emisionesRoutes === 'function');
app.use('/emisiones', emisionesRoutes);
console.log('cargosRoutes type:', typeof cargosRoutes, 'is function?', typeof cargosRoutes === 'function');
app.use('/cargos', cargosRoutes);
console.log('pagosRoutes type:', typeof pagosRoutes, 'is function?', typeof pagosRoutes === 'function');
app.use('/pagos', pagosRoutes);
console.log('prorrateoRoutes type:', typeof prorrateoRoutes, 'is function?', typeof prorrateoRoutes === 'function');
app.use('/prorrateo', prorrateoRoutes);
console.log('medidoresRoutes type:', typeof medidoresRoutes, 'is function?', typeof medidoresRoutes === 'function');
app.use('/medidores', medidoresRoutes);
console.log('tarifasConsumoRoutes type:', typeof tarifasConsumoRoutes, 'is function?', typeof tarifasConsumoRoutes === 'function');
app.use('/tarifas-consumo', tarifasConsumoRoutes);
console.log('multasRoutes type:', typeof multasRoutes, 'is function?', typeof multasRoutes === 'function');
app.use('/multas', multasRoutes);
console.log('conciliacionesRoutes type:', typeof conciliacionesRoutes, 'is function?', typeof conciliacionesRoutes === 'function');
app.use('/conciliaciones', conciliacionesRoutes);
console.log('consumosRoutes type:', typeof consumosRoutes, 'is function?', typeof consumosRoutes === 'function');
app.use('/consumos', consumosRoutes);
console.log('webhooksRoutes type:', typeof webhooksRoutes, 'is function?', typeof webhooksRoutes === 'function');
app.use('/webhooks', webhooksRoutes);
console.log('amenidadesRoutes type:', typeof amenidadesRoutes, 'is function?', typeof amenidadesRoutes === 'function');
app.use('/amenidades', amenidadesRoutes);
app.use('/', soporteRoutes); // soporte exposes varios paths: tickets, notificaciones, documentos, bitacora, parametros
console.log('utilRoutes type:', typeof utilRoutes, 'is function?', typeof utilRoutes === 'function');
app.use('/util', utilRoutes);
console.log('filesRoutes type:', typeof filesRoutes, 'is function?', typeof filesRoutes === 'function');
app.use('/files', filesRoutes);
console.log('valorUtmRoutes type:', typeof valorUtmRoutes, 'is function?', typeof valorUtmRoutes === 'function');
app.use('/api/valor-utm', valorUtmRoutes);
console.log('dashboardRoutes type:', typeof dashboardRoutes, 'is function?', typeof dashboardRoutes === 'function');
app.use('/dashboard', dashboardRoutes);
console.log('reportesRoutes type:', typeof reportesRoutes, 'is function?', typeof reportesRoutes === 'function');
app.use('/reportes', reportesRoutes);
console.log('notificacionesRoutes type:', typeof notificacionesRoutes, 'is function?', typeof notificacionesRoutes === 'function');
app.use('/notificaciones', notificacionesRoutes);
console.log('ticketsRoutes type:', typeof ticketsRoutes, 'is function?', typeof ticketsRoutes === 'function');
app.use('/tickets', ticketsRoutes);
console.log('paymentGatewayRoutes type:', typeof paymentGatewayRoutes, 'is function?', typeof paymentGatewayRoutes === 'function');
app.use('/gateway', paymentGatewayRoutes);
console.log('apelacionesRouter type:', typeof apelacionesRouter, 'is function?', typeof apelacionesRouter === 'function');
app.use('/apelaciones', apelacionesRouter);
console.log('comprasRouter type:', typeof comprasRouter, 'is function?', typeof comprasRouter === 'function');
app.use('/compras', comprasRouter);

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));

async function start() {
	try {
		await sequelize.authenticate();
		logger.info('Sequelize connected');
	} catch (err) {
		logger.error('Failed to connect to DB: %s', err && err.message);
		if (process.env.SKIP_DB_CONNECT === 'true') {
			logger.warn('SKIP_DB_CONNECT=true — continuing without DB connection (development only)');
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
			logger.info('✅ Scheduler de indicadores iniciado');
		} catch (error) {
			logger.error('❌ Error iniciando scheduler:', error);
		}
	});
}

// Solo inicia el servidor si no estamos en modo test
if (require.main === module) {
	start();
}

// Exportar app para tests
module.exports = app;

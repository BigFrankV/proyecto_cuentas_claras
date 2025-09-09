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
const medidoresRoutes = require('./routes/medidores');
const tarifasConsumoRoutes = require('./routes/tarifasConsumo');
const multasRoutes = require('./routes/multas');
const conciliacionesRoutes = require('./routes/conciliaciones');
const webhooksRoutes = require('./routes/webhooks');
const amenidadesRoutes = require('./routes/amenidades');
const soporteRoutes = require('./routes/soporte');
const utilRoutes = require('./routes/util');
const sequelize = require('./sequelize');
const logger = require('./logger');
const { setupSwagger } = require('./swagger');

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

app.use('/auth', authRoutes);
app.use('/comunidades', comunidadRoutes);
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
app.use('/medidores', medidoresRoutes);
app.use('/tarifas-consumo', tarifasConsumoRoutes);
app.use('/multas', multasRoutes);
app.use('/conciliaciones', conciliacionesRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/amenidades', amenidadesRoutes);
app.use('/', soporteRoutes); // soporte exposes varios paths: tickets, notificaciones, documentos, bitacora, parametros
app.use('/util', utilRoutes);

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
	app.listen(port, () => logger.info(`Server running on port ${port}`));
}

start();

const logger = require('../logger');

/**
 * Middleware para validar configuración de pasarelas de pago
 */
const validatePaymentConfig = () => {
  return (req, res, next) => {
    const requiredEnvVars = {
      webpay: [
        'WEBPAY_COMMERCE_CODE',
        'WEBPAY_API_KEY',
        'WEBPAY_ENVIRONMENT'
      ],
      khipu: [
        'KHIPU_RECEIVER_ID', 
        'KHIPU_SECRET',
        'KHIPU_ENVIRONMENT'
      ],
      mercadopago: [
        'MERCADOPAGO_ACCESS_TOKEN',
        'MERCADOPAGO_PUBLIC_KEY',
        'MERCADOPAGO_ENVIRONMENT'
      ]
    };

    const missingVars = [];
    
    Object.entries(requiredEnvVars).forEach(([gateway, vars]) => {
      vars.forEach(envVar => {
        if (!process.env[envVar]) {
          missingVars.push(`${gateway}: ${envVar}`);
        }
      });
    });

    if (missingVars.length > 0) {
      logger.warn('Missing payment gateway configuration:', missingVars);
      
      // Solo advertir, no bloquear la aplicación
      req.paymentConfigWarnings = missingVars;
    }

    next();
  };
};

/**
 * Middleware para validar configuración específica de una pasarela
 */
const validateGatewayConfig = (gateway) => {
  return (req, res, next) => {
    const configMap = {
      webpay: {
        commerceCode: process.env.WEBPAY_COMMERCE_CODE,
        apiKey: process.env.WEBPAY_API_KEY,
        environment: process.env.WEBPAY_ENVIRONMENT
      },
      khipu: {
        receiverId: process.env.KHIPU_RECEIVER_ID,
        secret: process.env.KHIPU_SECRET,
        environment: process.env.KHIPU_ENVIRONMENT
      },
      mercadopago: {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
        environment: process.env.MERCADOPAGO_ENVIRONMENT
      }
    };

    const config = configMap[gateway];
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: `Pasarela ${gateway} no soportada`
      });
    }

    const missingValues = Object.entries(config).filter(([, value]) => !value);
    
    if (missingValues.length > 0) {
      return res.status(503).json({
        success: false,
        error: `Pasarela ${gateway} no está configurada correctamente`,
        missingConfig: missingValues.map(([key]) => key)
      });
    }

    req.gatewayConfig = config;
    next();
  };
};

/**
 * Middleware para log de transacciones
 */
const logPaymentTransaction = (action) => {
  return (req, res, next) => {
    // Interceptar la respuesta para loggear el resultado
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log de la transacción
      logger.info(`Payment ${action}:`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: req.body,
        response: typeof data === 'string' ? JSON.parse(data) : data,
        timestamp: new Date().toISOString()
      });

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para validar amounts y currency
 */
const validateAmount = () => {
  return (req, res, next) => {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Monto debe ser un número positivo'
      });
    }

    // Monto mínimo para Chile: $100 CLP
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Monto mínimo es $100 CLP'
      });
    }

    // Monto máximo para evitar errores: $50,000,000 CLP
    if (amount > 50000000) {
      return res.status(400).json({
        success: false,
        error: 'Monto máximo es $50,000,000 CLP'
      });
    }

    // Redondear a entero (CLP no tiene decimales)
    req.body.amount = Math.round(amount);
    
    next();
  };
};

/**
 * Middleware para sanitizar datos de pago
 */
const sanitizePaymentData = () => {
  return (req, res, next) => {
    const { description, payerEmail } = req.body;
    
    // Sanitizar descripción
    if (description) {
      req.body.description = description
        .trim()
        .substring(0, 255) // Limitar longitud
        .replace(/[<>]/g, ''); // Remover caracteres problemáticos
    }

    // Validar email si se proporciona
    if (payerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payerEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Email del pagador no es válido'
        });
      }
    }

    next();
  };
};

/**
 * Middleware de rate limiting para transacciones
 */
const paymentRateLimit = () => {
  const attempts = new Map();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutos

  return (req, res, next) => {
    const identifier = req.ip + ':' + (req.user?.id || 'anonymous');
    const now = Date.now();
    
    if (!attempts.has(identifier)) {
      attempts.set(identifier, []);
    }

    const userAttempts = attempts.get(identifier);
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Demasiados intentos de pago. Intente en 15 minutos.',
        retryAfter: windowMs
      });
    }

    // Agregar el intento actual
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);

    // Limpiar intentos antiguos periódicamente
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, times] of attempts.entries()) {
        const recent = times.filter(time => now - time < windowMs);
        if (recent.length === 0) {
          attempts.delete(key);
        } else {
          attempts.set(key, recent);
        }
      }
    }

    next();
  };
};

module.exports = {
  validatePaymentConfig,
  validateGatewayConfig,
  logPaymentTransaction,
  validateAmount,
  sanitizePaymentData,
  paymentRateLimit
};
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize, requireCommunity } = require('../middleware/authorize');
const paymentGatewayService = require('../services/paymentGatewayService');
const logger = require('../logger');

/**
 * @openapi
 * tags:
 *   - name: Payment Gateway
 *     description: Integración con pasarelas de pago
 */

/**
 * @openapi
 * /gateway/available:
 *   get:
 *     tags: [Payment Gateway]
 *     summary: Listar pasarelas de pago disponibles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pasarelas disponibles
 */
router.get('/available', authenticate, async (req, res) => {
  try {
    const gateways = paymentGatewayService.getAvailableGateways();
    res.json({
      success: true,
      gateways
    });
  } catch (error) {
    logger.error('Error getting available gateways:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener pasarelas disponibles'
    });
  }
});

/**
 * @openapi
 * /gateway/create-payment:
 *   post:
 *     tags: [Payment Gateway]
 *     summary: Crear transacción de pago
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - communityId
 *               - amount
 *               - gateway
 *               - description
 *             properties:
 *               communityId:
 *                 type: integer
 *               unitId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               gateway:
 *                 type: string
 *                 enum: [webpay, khipu, mercadopago]
 *               description:
 *                 type: string
 *               payerEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 */
router.post('/create-payment', [
  authenticate,
  body('communityId').isInt().withMessage('ID de comunidad requerido'),
  body('amount').isFloat({ min: 100 }).withMessage('Monto mínimo $100'),
  body('gateway').isIn(['webpay', 'khipu', 'mercadopago']).withMessage('Pasarela no válida'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('payerEmail').optional().isEmail().withMessage('Email no válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { communityId, unitId, amount, gateway, description, payerEmail } = req.body;
    const userId = req.user.id;

    // Verificar acceso a la comunidad
    const [communities] = await db.query(
      'SELECT id FROM comunidad WHERE id = ? LIMIT 1',
      [communityId]
    );

    if (!communities.length) {
      return res.status(404).json({
        success: false,
        error: 'Comunidad no encontrada'
      });
    }

    // Verificar que la pasarela esté configurada
    if (!paymentGatewayService.validateGatewayConfig(gateway)) {
      return res.status(400).json({
        success: false,
        error: `Pasarela ${gateway} no está configurada`
      });
    }

    // Generar order ID único
    const orderId = paymentGatewayService.generateOrderId(communityId, unitId);

    // Preparar datos de la orden
    const orderData = {
      orderId,
      sessionId: `session_${userId}_${Date.now()}`,
      communityId,
      unitId,
      amount: Math.round(amount), // Redondear a entero para CLP
      description,
      payerEmail: payerEmail || req.user.email
    };

    let result;

    // Crear transacción según la pasarela
    switch (gateway) {
      case 'webpay':
        result = await paymentGatewayService.createWebpayTransaction(orderData);
        break;
      case 'khipu':
        result = await paymentGatewayService.createKhipuPayment(orderData);
        break;
      case 'mercadopago':
        result = await paymentGatewayService.createMercadoPagoPreference(orderData);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Pasarela no soportada'
        });
    }

    // Log del intento
    await db.query(
      `INSERT INTO payment_attempt_log (order_id, gateway, action, request_data, response_data, ip_address, user_agent) 
       VALUES (?, ?, 'create', ?, ?, ?, ?)`,
      [
        orderId,
        gateway,
        JSON.stringify(orderData),
        JSON.stringify(result),
        req.ip,
        req.get('User-Agent')
      ]
    );

    res.status(201).json({
      success: true,
      orderId,
      transactionId: result.transactionId,
      paymentUrl: result.paymentUrl,
      gateway: result.gateway,
      amount: orderData.amount
    });

  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear transacción de pago'
    });
  }
});

/**
 * @openapi
 * /gateway/confirm-payment:
 *   post:
 *     tags: [Payment Gateway]
 *     summary: Confirmar pago (callback desde pasarela)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token_ws:
 *                 type: string
 *               orderId:
 *                 type: string
 *               gateway:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago confirmado
 */
router.post('/confirm-payment', async (req, res) => {
  try {
    const { token_ws, orderId, gateway } = req.body;

    if (!token_ws && !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Token o order ID requerido'
      });
    }

    let result;

    // Confirmar según la pasarela
    if (token_ws) {
      // Webpay confirmation
      result = await paymentGatewayService.confirmWebpayTransaction(token_ws);
    } else {
      // Obtener transacción por order ID para otros gateways
      const transaction = await paymentGatewayService.getTransactionByOrderId(orderId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada'
        });
      }

      result = {
        success: transaction.status === 'approved',
        transactionId: transaction.gateway_transaction_id,
        gateway: transaction.gateway
      };
    }

    // Log de confirmación
    await db.query(
      `INSERT INTO payment_attempt_log (order_id, gateway, action, response_data, ip_address, user_agent) 
       VALUES (?, ?, 'confirm', ?, ?, ?)`,
      [
        orderId || 'unknown',
        gateway || result.gateway,
        JSON.stringify(result),
        req.ip,
        req.get('User-Agent')
      ]
    );

    res.json({
      success: result.success,
      transactionId: result.transactionId,
      authorizationCode: result.authorizationCode,
      gateway: result.gateway
    });

  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al confirmar pago'
    });
  }
});

/**
 * @openapi
 * /gateway/transaction/{orderId}:
 *   get:
 *     tags: [Payment Gateway]
 *     summary: Obtener estado de transacción
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la transacción
 */
router.get('/transaction/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await paymentGatewayService.getTransactionByOrderId(orderId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }

    // Verificar acceso (propietario o admin de la comunidad)
    const hasAccess = req.user.is_superadmin || 
                     transaction.comunidad_id === req.user.comunidad_id ||
                     transaction.persona_id === req.user.persona_id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'No tiene acceso a esta transacción'
      });
    }

    res.json({
      success: true,
      transaction: {
        orderId: transaction.order_id,
        amount: transaction.amount,
        status: transaction.status,
        gateway: transaction.gateway,
        description: transaction.description,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });

  } catch (error) {
    logger.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener transacción'
    });
  }
});

/**
 * @openapi
 * /gateway/community/{communityId}/transactions:
 *   get:
 *     tags: [Payment Gateway]
 *     summary: Listar transacciones de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, expired]
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [webpay, khipu, mercadopago]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
router.get('/community/:communityId/transactions', [
  authenticate,
  authorize('admin', 'superadmin')
], async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status, gateway, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Construir query con filtros
    let whereClause = 'WHERE comunidad_id = ?';
    const params = [communityId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (gateway) {
      whereClause += ' AND gateway = ?';
      params.push(gateway);
    }

    // Obtener transacciones
    const [transactions] = await db.query(
      `SELECT order_id, amount, gateway, status, description, created_at, updated_at 
       FROM payment_transaction 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Obtener total para paginación
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM payment_transaction ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    logger.error('Error getting community transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener transacciones'
    });
  }
});

/**
 * @openapi
 * /gateway/webhook/webpay:
 *   post:
 *     tags: [Payment Gateway]
 *     summary: Webhook para notificaciones de Webpay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado
 */
router.post('/webhook/webpay', async (req, res) => {
  try {
    const payload = req.body;
    
    // Log del webhook
    await db.query(
      `INSERT INTO payment_attempt_log (order_id, gateway, action, request_data, ip_address, user_agent) 
       VALUES (?, 'webpay', 'webhook', ?, ?, ?)`,
      [
        payload.buyOrder || 'unknown',
        JSON.stringify(payload),
        req.ip,
        req.get('User-Agent')
      ]
    );

    // Procesar webhook si es necesario
    if (payload.token_ws) {
      try {
        await paymentGatewayService.confirmWebpayTransaction(payload.token_ws);
      } catch (error) {
        logger.error('Error processing Webpay webhook:', error);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Error processing Webpay webhook:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
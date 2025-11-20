const { WebpayPlus } = require('transbank-sdk');
const { Options, Environment } = require('transbank-sdk');
const axios = require('axios');
const db = require('../db');
const logger = require('../logger');

/**
 * Servicio para integración con pasarelas de pago chilenas
 * Soporta: Webpay Plus (Transbank), Khipu, y Mercado Pago
 */
class PaymentGatewayService {
  constructor() {
    // Configuración de Webpay Plus (Transbank)
    this.webpayConfig = {
      commerceCode: process.env.WEBPAY_COMMERCE_CODE || '597055555532',
      apiKey:
        process.env.WEBPAY_API_KEY ||
        '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
      environment:
        process.env.NODE_ENV === 'production'
          ? Environment.Production
          : Environment.Integration,
    };

    // Configuración de Khipu
    this.khipuConfig = {
      receiverId: process.env.KHIPU_RECEIVER_ID,
      secret: process.env.KHIPU_SECRET,
      baseUrl: 'https://khipu.com/api/2.0',
    };

    // Configuración de Mercado Pago
    this.mercadoPagoConfig = {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      baseUrl: 'https://api.mercadopago.com',
    };

    // URLs de retorno
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.returnUrls = {
      success: `${this.baseUrl}/pagos/exito`,
      failure: `${this.baseUrl}/pagos/error`,
      pending: `${this.baseUrl}/pagos/pendiente`,
    };
  }

  // =================== WEBPAY PLUS (TRANSBANK) ===================

  /**
   * Crear transacción en Webpay Plus
   */
  async createWebpayTransaction(orderData) {
    try {
      const { amount, orderId, sessionId } = orderData;

      // Configurar Webpay
      const tx = new WebpayPlus.Transaction(
        new Options(
          this.webpayConfig.commerceCode,
          this.webpayConfig.apiKey,
          this.webpayConfig.environment
        )
      );

      // Crear transacción
      const response = await tx.create(
        orderId,
        sessionId,
        amount,
        `${this.baseUrl}/multas/pago/resultado`
      );

      // Para Webpay, la transacción ya está guardada en multas.js, solo devolver respuesta
      return {
        success: true,
        transactionId: response.token,
        paymentUrl: response.url,
        gateway: 'webpay',
        gatewayResponse: response, // Devolver para guardar en multas.js
      };
    } catch (error) {
      logger.error('Error creating Webpay transaction:', error);
      throw new Error('No se pudo crear la transacción con Webpay');
    }
  }

  /**
   * Confirmar transacción de Webpay
   */
  async confirmWebpayTransaction(token) {
    try {
      const tx = new WebpayPlus.Transaction(
        new Options(
          this.webpayConfig.commerceCode,
          this.webpayConfig.apiKey,
          this.webpayConfig.environment
        )
      );

      const response = await tx.commit(token);

      // Actualizar transacción en BD
      await this.updateTransactionStatus(
        token,
        response.response_code === 0 ? 'completed' : 'failed',
        response
      );

      return {
        success: response.response_code === 0,
        transactionId: token,
        authorizationCode: response.authorization_code,
        amount: response.amount,
        gateway: 'webpay',
        response,
      };
    } catch (error) {
      logger.error('Error confirming Webpay transaction:', error);
      throw new Error('Error al confirmar transacción con Webpay');
    }
  }

  // =================== KHIPU ===================

  /**
   * Crear pago en Khipu
   */
  async createKhipuPayment(orderData) {
    try {
      const { amount, orderId, communityId, unitId, description, payerEmail } =
        orderData;

      const payload = {
        receiver_id: this.khipuConfig.receiverId,
        subject: description || `Pago Cuentas Claras - Orden ${orderId}`,
        amount: amount,
        currency: 'CLP',
        transaction_id: orderId,
        return_url: `${this.returnUrls.success}?orderId=${orderId}`,
        cancel_url: `${this.returnUrls.failure}?orderId=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/webhooks/pagos/khipu`,
        payer_email: payerEmail,
      };

      const response = await axios.post(
        `${this.khipuConfig.baseUrl}/payments`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.khipuConfig.secret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Guardar transacción en BD
      await this.saveTransaction({
        orderId,
        communityId,
        unitId,
        amount,
        gateway: 'khipu',
        gatewayTransactionId: response.data.payment_id,
        status: 'pending',
        description,
        gatewayResponse: JSON.stringify(response.data),
      });

      return {
        success: true,
        transactionId: response.data.payment_id,
        paymentUrl: response.data.payment_url,
        gateway: 'khipu',
      };
    } catch (error) {
      logger.error('Error creating Khipu payment:', error);
      throw new Error('No se pudo crear el pago con Khipu');
    }
  }

  // =================== MERCADO PAGO ===================

  /**
   * Crear preferencia en Mercado Pago
   */
  async createMercadoPagoPreference(orderData) {
    try {
      const { amount, orderId, communityId, unitId, description, payerEmail } =
        orderData;

      const preference = {
        items: [
          {
            title: description || `Pago Cuentas Claras - Orden ${orderId}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'CLP',
          },
        ],
        external_reference: orderId,
        back_urls: {
          success: `${this.returnUrls.success}?orderId=${orderId}`,
          failure: `${this.returnUrls.failure}?orderId=${orderId}`,
          pending: `${this.returnUrls.pending}?orderId=${orderId}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/webhooks/pagos/mercadopago`,
        payer: {
          email: payerEmail,
        },
      };

      const response = await axios.post(
        `${this.mercadoPagoConfig.baseUrl}/checkout/preferences`,
        preference,
        {
          headers: {
            Authorization: `Bearer ${this.mercadoPagoConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Guardar transacción en BD
      await this.saveTransaction({
        orderId,
        communityId,
        unitId,
        amount,
        gateway: 'mercadopago',
        gatewayTransactionId: response.data.id,
        status: 'pending',
        description,
        gatewayResponse: JSON.stringify(response.data),
      });

      return {
        success: true,
        transactionId: response.data.id,
        paymentUrl: response.data.init_point,
        gateway: 'mercadopago',
      };
    } catch (error) {
      logger.error('Error creating MercadoPago preference:', error);
      throw new Error('No se pudo crear la preferencia con Mercado Pago');
    }
  }

  // =================== MÉTODOS AUXILIARES ===================

  /**
   * Guardar transacción en base de datos
   */
  async saveTransaction(transactionData) {
    const {
      orderId,
      communityId,
      multaId,
      amount,
      gateway,
      gatewayTransactionId,
      status,
      gatewayResponse,
    } = transactionData;

    try {
      const [result] = await db.query(
        `INSERT INTO payment_transaction 
         (order_id, comunidad_id, multa_id, amount, gateway, gateway_transaction_id, 
          status, gateway_response, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          communityId,
          multaId || null,
          amount,
          gateway,
          gatewayTransactionId,
          status,
          gatewayResponse,
        ]
      );

      return result.insertId;
    } catch (error) {
      logger.error('Error saving transaction:', error);
      throw new Error('Error al guardar transacción');
    }
  }

  /**
   * Actualizar estado de transacción
   */
  async updateTransactionStatus(gatewayTransactionId, status, gatewayResponse) {
    try {
      await db.query(
        `UPDATE payment_transaction 
         SET status = ?, gateway_response = ?, updated_at = NOW() 
         WHERE gateway_transaction_id = ?`,
        [status, JSON.stringify(gatewayResponse), gatewayTransactionId]
      );

      // Si el pago fue aprobado, crear registro en tabla pago
      if (status === 'completed') {
        await this.createPaymentRecord(gatewayTransactionId);
      }
    } catch (error) {
      logger.error('Error updating transaction status:', error);
      throw new Error('Error al actualizar estado de transacción');
    }
  }

  /**
   * Crear registro de pago en tabla principal
   */
  async createPaymentRecord(gatewayTransactionId) {
    try {
      // Obtener datos de la transacción
      const [transactions] = await db.query(
        'SELECT * FROM payment_transaction WHERE gateway_transaction_id = ? LIMIT 1',
        [gatewayTransactionId]
      );

      if (!transactions.length) {
        throw new Error('Transacción no encontrada');
      }

      const transaction = transactions[0];

      // Crear pago en tabla principal
      await db.query(
        `INSERT INTO pago 
         (comunidad_id, unidad_id, fecha, monto, medio, referencia, estado, created_at) 
         VALUES (?, ?, NOW(), ?, ?, ?, 'aplicado', NOW())`,
        [
          transaction.comunidad_id,
          transaction.multa_id ? null : transaction.unidad_id,
          transaction.amount,
          transaction.gateway,
          gatewayTransactionId,
        ]
      );
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw new Error('Error al crear registro de pago');
    }
  }

  /**
   * Obtener transacción por order ID
   */
  async getTransactionByOrderId(orderId) {
    try {
      const [transactions] = await db.query(
        'SELECT * FROM payment_transaction WHERE order_id = ? LIMIT 1',
        [orderId]
      );

      return transactions.length ? transactions[0] : null;
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw new Error('Error al obtener transacción');
    }
  }

  /**
   * Generar ID único para orden
   */
  generateOrderId(communityId, unitId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CC-${communityId}-${unitId || 'X'}-${timestamp}-${random}`;
  }

  /**
   * Validar configuración de pasarelas
   */
  validateGatewayConfig(gateway) {
    switch (gateway) {
      case 'webpay':
        return this.webpayConfig.commerceCode && this.webpayConfig.apiKey;
      case 'khipu':
        return this.khipuConfig.receiverId && this.khipuConfig.secret;
      case 'mercadopago':
        return this.mercadoPagoConfig.accessToken;
      default:
        return false;
    }
  }

  /**
   * Listar pasarelas disponibles
   */
  getAvailableGateways() {
    const gateways = [];

    if (this.validateGatewayConfig('webpay')) {
      gateways.push({
        id: 'webpay',
        name: 'Webpay Plus',
        description: 'Pago con tarjetas de crédito y débito',
        logo: '/images/webpay-logo.png',
        fees: 'Comisión según tarjeta',
      });
    }

    if (this.validateGatewayConfig('khipu')) {
      gateways.push({
        id: 'khipu',
        name: 'Khipu',
        description: 'Transferencia bancaria simplificada',
        logo: '/images/khipu-logo.png',
        fees: 'Comisión fija por transacción',
      });
    }

    if (this.validateGatewayConfig('mercadopago')) {
      gateways.push({
        id: 'mercadopago',
        name: 'Mercado Pago',
        description: 'Múltiples medios de pago',
        logo: '/images/mercadopago-logo.png',
        fees: 'Comisión variable según medio',
      });
    }

    return gateways;
  }
}

module.exports = new PaymentGatewayService();

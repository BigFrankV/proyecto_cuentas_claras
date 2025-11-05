# Sistema de Pasarelas de Pago - Cuentas Claras

Este documento describe la implementación del sistema de pasarelas de pago integrado para el proyecto Cuentas Claras, diseñado específicamente para el mercado chileno.

## 🚀 Características Principales

- **Múltiples Pasarelas**: Integración con Webpay Plus (Transbank), Khipu y MercadoPago
- **Transacciones Seguras**: Manejo completo del ciclo de vida de las transacciones
- **Webhooks**: Notificaciones automáticas de estado de pagos
- **Auditoría**: Log completo de todas las transacciones y intentos
- **Rate Limiting**: Protección contra abuso y ataques
- **Validaciones**: Verificación de montos, emails y datos de pago

## 📋 Pasarelas Soportadas

### 1. Webpay Plus (Transbank) - ⭐ Principal

- **Tipo**: Tarjetas de crédito y débito
- **Tiempo de procesamiento**: Inmediato
- **Uso recomendado**: Pasarela principal para Chile
- **Documentación**: [Transbank Developers](https://www.transbankdevelopers.cl/)

### 2. Khipu

- **Tipo**: Transferencias bancarias
- **Tiempo de procesamiento**: 1-2 días hábiles
- **Uso recomendado**: Alternativa para transferencias
- **Documentación**: [Khipu API](https://khipu.com/page/api-doc)

### 3. MercadoPago

- **Tipo**: Múltiples métodos de pago
- **Tiempo de procesamiento**: Inmediato
- **Uso recomendado**: Alternativa con más opciones
- **Documentación**: [MercadoPago Chile](https://www.mercadopago.cl/developers)

## 🛠️ Instalación

### Opción 1: Script Automático (Recomendado)

```bash
# En Windows (PowerShell)
.\install-payment-gateways.ps1

# En Linux/Mac
chmod +x install-payment-gateways.sh
./install-payment-gateways.sh
```

### Opción 2: Instalación Manual

1. **Instalar dependencias NPM**:

```bash
npm install transbank-sdk axios node-cron
```

2. **Ejecutar migración de base de datos**:

```bash
mysql -u[usuario] -p[password] [database] < migrations/add_payment_gateways.sql
```

3. **Configurar variables de entorno**:

```bash
cp .env.payment.example .env
# Editar .env con sus credenciales
```

4. **Agregar rutas al app.js**:

```javascript
app.use('/api/gateway', require('./routes/paymentGateway'));
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Webpay Plus (Transbank)
WEBPAY_COMMERCE_CODE=597055555532
WEBPAY_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
WEBPAY_ENVIRONMENT=integration
WEBPAY_RETURN_URL=http://localhost:3001/payment/webpay/return

# Khipu
KHIPU_RECEIVER_ID=your-khipu-receiver-id
KHIPU_SECRET=your-khipu-secret-key
KHIPU_ENVIRONMENT=sandbox

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key
MERCADOPAGO_ENVIRONMENT=sandbox
```

### Para Producción

1. Cambiar ambientes a `production`
2. Usar credenciales reales de cada pasarela
3. Actualizar URLs con el dominio real
4. Configurar SSL/HTTPS obligatorio

## 📡 API Endpoints

### Endpoints Principales

```
GET    /api/gateway/available                    # Listar pasarelas disponibles
POST   /api/gateway/create-payment              # Crear nueva transacción
POST   /api/gateway/confirm-payment             # Confirmar pago
GET    /api/gateway/transaction/:orderId        # Obtener estado de transacción
GET    /api/gateway/community/:id/transactions  # Listar transacciones de comunidad
```

### Webhooks

```
POST   /api/gateway/webhook/webpay              # Webhook Webpay
POST   /api/gateway/webhook/khipu               # Webhook Khipu
POST   /api/gateway/webhook/mercadopago         # Webhook MercadoPago
```

## 💳 Uso en Frontend

### Componente de Pago Básico

```tsx
import PaymentComponent from '@/components/PaymentComponent';

<PaymentComponent
  communityId={1}
  amount={50000}
  description="Pago de gastos comunes"
  onSuccess={(transactionId) => console.log('Pago exitoso:', transactionId)}
  onError={(error) => console.error('Error:', error)}
/>;
```

### Ejemplo de Implementación

```javascript
// Crear transacción
const response = await fetch('/api/gateway/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    communityId: 1,
    amount: 50000,
    gateway: 'webpay',
    description: 'Pago de gastos comunes',
    payerEmail: 'usuario@email.com',
  }),
});

const { paymentUrl, orderId } = await response.json();

// Redirigir a la pasarela
window.location.href = paymentUrl;
```

## 🗄️ Estructura de Base de Datos

### Tabla `payment_transaction`

- Almacena todas las transacciones de pago
- Estados: pending, approved, rejected, cancelled, expired
- Información completa de la transacción

### Tabla `community_payment_config`

- Configuración por comunidad
- Pasarelas habilitadas por comunidad
- Configuraciones específicas

### Tabla `payment_attempt_log`

- Log de auditoría de todos los intentos
- Incluye requests, responses y errores
- Para debugging y compliance

## 🔒 Seguridad

### Medidas Implementadas

1. **Rate Limiting**: 5 intentos por 15 minutos
2. **Validación de Montos**: Mínimo $100, máximo $50,000,000 CLP
3. **Sanitización**: Limpieza de inputs de usuario
4. **Logging**: Auditoría completa de transacciones
5. **Timeouts**: Límites de tiempo para transacciones

### Consideraciones de Producción

- Usar HTTPS obligatorio
- Configurar CORS apropiadamente
- Implementar autenticación robusta
- Monitorear logs de seguridad
- Realizar backups regulares

## 📊 Monitoreo y Logs

### Logs Incluidos

- Creación de transacciones
- Confirmaciones de pago
- Errores y timeouts
- Webhooks recibidos
- Intentos fallidos

### Métricas Recomendadas

- Tasa de éxito por pasarela
- Tiempo promedio de procesamiento
- Volumen de transacciones
- Errores más frecuentes

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error 503**: Pasarela no configurada

   - Verificar variables de entorno
   - Confirmar credenciales válidas

2. **Timeout en pagos**:

   - Verificar conectividad
   - Revisar logs de la pasarela

3. **Webhooks no llegan**:
   - Verificar URLs configuradas
   - Confirmar que el puerto esté abierto

### Debugging

```bash
# Activar logs detallados
export PAYMENT_DEBUG_LOGS=true
export PAYMENT_LOG_LEVEL=debug

# Verificar estado de pasarelas
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/gateway/available
```

## 📈 Roadmap

### Próximas Características

- [ ] Pagos recurrentes
- [ ] Suscripciones automáticas
- [ ] Reportes avanzados
- [ ] Dashboard de administración
- [ ] Integración con más pasarelas
- [ ] Tokenización de tarjetas

## 📞 Soporte

### Documentación de Pasarelas

- **Transbank**: [developers.transbank.cl](https://www.transbankdevelopers.cl/)
- **Khipu**: [khipu.com/page/api-doc](https://khipu.com/page/api-doc)
- **MercadoPago**: [developers.mercadopago.cl](https://www.mercadopago.cl/developers)

### Contacto del Proyecto

Para soporte específico del proyecto Cuentas Claras:

- Revisar issues en GitHub
- Consultar documentación del proyecto
- Verificar logs de aplicación

---

## 📄 Licencia

Este sistema de pagos es parte del proyecto Cuentas Claras y está sujeto a la misma licencia del proyecto principal.

---

**⚠️ Importante**: Siempre use credenciales de sandbox/integración para desarrollo y testing. Solo use credenciales de producción en ambiente productivo con todas las medidas de seguridad implementadas.

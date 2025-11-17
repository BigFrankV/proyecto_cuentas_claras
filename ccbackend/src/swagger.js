const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Cuentas Claras API',
      version: '2.0.0',
      description: `
        ## 🏢 API de Gestión para Comunidades Residenciales
        
        Sistema completo para la administración de comunidades, edificios y condominios con arquitectura REST.
        
        ### 📦 Módulos Principales
        
        - **🔐 Autenticación**: Login/Register con JWT, 2FA, recuperación de contraseña
        - **🏘️ Comunidades**: CRUD, dashboard con estadísticas, flujo de caja
        - **🏗️ Edificios y Torres**: Gestión de estructuras físicas y unidades
        - **👥 Usuarios y Roles**: Sistema jerárquico de 7 niveles de acceso
        - **💰 Finanzas**: Gastos comunes, pagos, cargos, conciliaciones
        - **📋 Emisiones**: Generación de gastos comunes con prorrateo
        - **⚡ Amenidades**: Reservas y gestión de espacios comunes
        - **🔧 Soporte**: Tickets, notificaciones, bitácora de conserjería
        - **💳 Payment Gateway**: Integración con Webpay y Khipu
        - **📄 Files**: Upload y gestión de archivos
        
        ### 🔐 Autenticación JWT
        
        La API usa **JSON Web Tokens (JWT)**. Incluya el token en cada request:
        \`\`\`
        Authorization: Bearer {your-jwt-token}
        \`\`\`
        
        **Obtener token:**
        1. POST /auth/login con \`identifier\` + \`password\`
        2. Copiar \`token\` de la respuesta
        3. Usar en header \`Authorization: Bearer {token}\`
        
        ### 🎭 Sistema de Roles (nivel_acceso 1-7)
        
        | Nivel | Código | Permisos |
        |-------|--------|----------|
        | 1 | superadmin | Acceso total al sistema |
        | 2 | admin | Gestión completa de comunidad |
        | 3 | comite | Aprobación de gastos |
        | 4 | contador | Gestión financiera |
        | 5 | conserje | Bitácora y notificaciones |
        | 6 | propietario | Visualización y pagos |
        | 7 | residente | Solo consultas |
        
        ### 📊 Endpoints Destacados
        
        **Dashboard:** \`GET /comunidades/{id}/dashboard\`
        - Estadísticas de unidades, residentes, finanzas
        - Top 5 cargos pendientes
        - Actividad reciente (últimos pagos)
        
        **Miembros:** \`GET /comunidades/{id}/miembros\` o \`/residentes\`
        - Lista de usuarios con roles por comunidad
        
        **Torres por Comunidad:** \`GET /torres/comunidad/{id}\`
        - Obtener todas las torres de una comunidad
        
        **2FA:** \`POST /auth/verify-2fa\`
        - Verificación de autenticación de dos factores
        
        ### ⚠️ Cambios Importantes v2.0
        
        **Tablas actualizadas:**
        - Vista \`cargo_unidad\` (de \`cuenta_cobro_unidad\`)
        - Tabla \`pago\` usa campos \`fecha\` y \`medio\` (no fecha_pago/medio_pago)
        - Tabla \`comunidad\` usa IDs tipo BIGINT
        
        **Nuevos endpoints:**
        - POST /auth/verify-2fa
        - GET /comunidades/{id}/dashboard
        - GET /comunidades/{id}/miembros
        - GET /torres/comunidad/{id}
        
        **Credenciales de prueba:**
        - Email: patricio@pquintanilla.cl
        - Password: 123456
        
        ---
        
        **v2.0.0** | Última actualización: Octubre 2025 | **Desarrollado por:** Patricio Quintanilla, Frank Vogt, Matías Román
      `,
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@cuentasclaras.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
      {
        url: 'https://apicc.pquintanilla.cl/',
        description: 'Servidor de Producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en el formato: Bearer {token}',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Token no válido',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Recurso no encontrado',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Datos de entrada inválidos',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Comunidad: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la comunidad',
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la comunidad',
            },
            direccion: {
              type: 'string',
              description: 'Dirección de la comunidad',
            },
            telefono: {
              type: 'string',
              description: 'Teléfono de contacto',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contacto',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona asociada al usuario',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        Rol: {
          type: 'object',
          description: 'Rol del sistema con nivel de acceso jerárquico',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del rol',
            },
            codigo: {
              type: 'string',
              enum: [
                'superadmin',
                'admin',
                'comite',
                'contador',
                'conserje',
                'propietario',
                'residente',
              ],
              description: 'Código identificador del rol',
            },
            nombre: {
              type: 'string',
              description: 'Nombre descriptivo del rol',
            },
            nivel_acceso: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description:
                'Nivel jerárquico (1=máximo acceso, 7=mínimo acceso)',
            },
          },
        },
        Membresia: {
          type: 'object',
          description: 'Asignación de rol de usuario en una comunidad',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la membresía',
            },
            comunidad_id: {
              type: 'integer',
              description: 'ID de la comunidad',
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario',
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona (derivado de usuario)',
            },
            rol: {
              type: 'string',
              description: 'Código del rol asignado',
            },
            rol_nombre: {
              type: 'string',
              description: 'Nombre del rol',
            },
            nivel_acceso: {
              type: 'integer',
              description: 'Nivel de acceso jerárquico',
            },
            desde: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio de la membresía',
            },
            hasta: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Fecha de fin de la membresía (null si indefinida)',
            },
            activo: {
              type: 'boolean',
              description: 'Si la membresía está activa',
            },
          },
        },
        JWTToken: {
          type: 'object',
          description: 'Token JWT con información del usuario autenticado',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT firmado',
            },
          },
        },
        JWTPayload: {
          type: 'object',
          description: 'Contenido decodificado del token JWT',
          properties: {
            sub: {
              type: 'integer',
              description: 'ID del usuario (subject)',
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario',
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona asociada',
            },
            roles: {
              type: 'array',
              description: 'Array de códigos de roles del usuario',
              items: {
                type: 'string',
              },
            },
            comunidad_id: {
              type: 'integer',
              nullable: true,
              description: 'ID de la primera comunidad del usuario',
            },
            memberships: {
              type: 'array',
              description: 'Lista de membresías del usuario por comunidad',
              items: {
                type: 'object',
                properties: {
                  comunidadId: {
                    type: 'integer',
                  },
                  rol: {
                    type: 'string',
                  },
                  nivel_acceso: {
                    type: 'integer',
                  },
                },
              },
            },
            is_superadmin: {
              type: 'boolean',
              description: 'DEPRECADO: usar sistema de roles en su lugar',
              deprecated: true,
            },
            iat: {
              type: 'integer',
              description: 'Timestamp de emisión del token',
            },
            exp: {
              type: 'integer',
              description: 'Timestamp de expiración del token',
            },
          },
        },
        Pago: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del pago',
            },
            monto: {
              type: 'number',
              format: 'decimal',
              description: 'Monto del pago',
            },
            fecha: {
              type: 'string',
              format: 'date',
              description: 'Fecha del pago',
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'completado', 'fallido'],
              description: 'Estado del pago',
            },
            metodo_pago: {
              type: 'string',
              description: 'Método de pago utilizado',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            code: {
              type: 'integer',
              description: 'Código de error',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error',
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'Auth',
        description:
          '🔐 Autenticación y autorización (Login, Register, 2FA, Password Reset)',
      },
      {
        name: 'Comunidades',
        description:
          '🏘️ CRUD de comunidades + Dashboard con estadísticas + Flujo de caja',
      },
      {
        name: 'Edificios',
        description:
          '🏗️ Gestión de edificios, torres y unidades habitacionales',
      },
      {
        name: 'Torres',
        description: '🗼 Gestión de torres por edificio o comunidad',
      },
      {
        name: 'Unidades',
        description: '🏠 Gestión de unidades, tenencias y residentes',
      },
      {
        name: 'Personas',
        description: '👤 CRUD de personas (propietarios, residentes, etc.)',
      },
      {
        name: 'Membresias',
        description: '👥 Asignación de roles de usuarios en comunidades',
      },
      {
        name: 'Cargos',
        description: '💸 Cuentas de cobro y cargos por unidad',
      },
      {
        name: 'Pagos',
        description: '💰 Registro y aplicación de pagos',
      },
      {
        name: 'Gastos',
        description: '💵 Gestión de gastos operacionales',
      },
      {
        name: 'Emisiones',
        description: '📋 Emisión de gastos comunes con prorrateo',
      },
      {
        name: 'Categorías de Gasto',
        description: '📂 Categorías para clasificar gastos',
      },
      {
        name: 'CentrosCosto',
        description: '🎯 Centros de costo para contabilidad',
      },
      {
        name: 'Proveedores',
        description: '🏪 Gestión de proveedores y servicios',
      },
      {
        name: 'DocumentosCompra',
        description: '📄 Facturas y documentos tributarios',
      },
      {
        name: 'Conciliaciones',
        description: '🏦 Conciliación bancaria',
      },
      {
        name: 'Amenidades',
        description: '⚡ Gestión de amenidades y reservas',
      },
      {
        name: 'Notificaciones',
        description: '📢 Sistema de notificaciones push y email',
      },
      {
        name: 'Reportes',
        description: '📊 Generación de reportes y estadísticas',
      },
      {
        name: 'Tickets',
        description: '🎫 Sistema de tickets de soporte',
      },
      {
        name: 'Compras',
        description: '� Gestión de compras y adquisiciones',
      },
      {
        name: 'Prorrateo',
        description: '⚖️ Cálculo y distribución de gastos comunes',
      },
      {
        name: 'Dashboard',
        description: '📈 Dashboard administrativo con KPIs',
      },
      {
        name: 'Consumos',
        description: '� Registro de consumos de servicios',
      },
      {
        name: 'Apelaciones',
        description: '⚖️ Gestión de apelaciones y reclamos',
      },
      {
        name: 'Soporte',
        description: '🔧 Tickets, notificaciones, bitácora y documentos',
      },
      {
        name: 'Payment Gateway',
        description: '💳 Integración con Webpay y Khipu',
      },
      {
        name: 'Files',
        description: '📁 Upload, descarga y gestión de archivos',
      },
      {
        name: 'Webhooks',
        description: '🔔 Webhooks para integraciones externas',
      },
      {
        name: 'Utilidades',
        description:
          '🛠️ Health check, UF, UTM, validación RUT, sync e indicadores',
      },
      {
        name: 'Tarifas de Consumo',
        description: '💲 Tarifas para cálculo de consumos',
      },
      {
        name: 'Medidores',
        description: '📊 Gestión de medidores y lecturas',
      },
      {
        name: 'Multas',
        description: '⚠️ Gestión de multas e infracciones',
      },
      {
        name: 'UTM',
        description: '📈 Valores UTM, conversiones y estadísticas',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

// Configuración personalizada de Swagger UI
function setupSwagger(app) {
  // Endpoint principal de documentación
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Endpoint alternativo para la documentación
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Endpoint para obtener el JSON de Swagger
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Información básica de la API
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Cuentas Claras API',
      version: '1.0.0',
      description: 'API de Gestión de Comunidades y Edificios',
      documentation: '/docs',
      swagger_json: '/swagger.json',
      health_check: '/health',
    });
  });
}

module.exports = { setupSwagger };

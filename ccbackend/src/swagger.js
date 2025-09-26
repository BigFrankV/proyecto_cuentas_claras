const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Cuentas Claras API',
      version: '1.0.0',
      description: `
        ## Sistema de Gestión Integral para Comunidades Residenciales
        
        La API **Cuentas Claras** constituye una solución tecnológica robusta y escalable diseñada para optimizar la administración integral de comunidades residenciales y edificios. El sistema proporciona un conjunto completo de herramientas que facilitan la gestión operativa y financiera de propiedades inmobiliarias.
        
        ### Funcionalidades Principales
        
        **Módulo de Gestión Inmobiliaria:**
        - Administración centralizada de comunidades residenciales y estructuras edilicias
        - Gestión de torres, unidades habitacionales y espacios comunes
        - Control de amenidades y servicios complementarios
        
        **Módulo de Gestión de Usuarios:**
        - Sistema de autenticación y autorización por roles
        - Administración de perfiles de usuarios y membresías
        - Control de accesos y permisos granulares
        
        **Módulo Financiero:**
        - Control integral de gastos operativos y extraordinarios
        - Gestión de proveedores y documentación comercial
        - Procesamiento de pagos y transacciones financieras
        - Conciliaciones bancarias automatizadas
        
        **Módulo de Control y Cumplimiento:**
        - Sistema de multas y sanciones administrativas
        - Seguimiento de consumos y mediciones
        - Generación de reportes y análisis estadísticos
        
        **Integración Tecnológica:**
        - APIs de pasarelas de pago certificadas
        - Integración con servicios de terceros
        - Arquitectura basada en microservicios
        
        ### Marco de Autenticación y Seguridad
        
        El sistema implementa un protocolo de seguridad basado en **JSON Web Tokens (JWT)** que garantiza la integridad y confidencialidad de las transacciones. La mayoría de los endpoints requieren autenticación mediante Bearer Token para acceder a los recursos protegidos.
        
        ### Códigos de Estado HTTP Estándar
        
        La API adhiere a las convenciones del protocolo HTTP para la comunicación cliente-servidor:
        
        - **200 OK**: Solicitud procesada exitosamente
        - **201 Created**: Recurso creado correctamente
        - **400 Bad Request**: Solicitud malformada o parámetros inválidos
        - **401 Unauthorized**: Credenciales de autenticación requeridas o inválidas
        - **403 Forbidden**: Acceso denegado por insuficiencia de permisos
        - **404 Not Found**: Recurso solicitado no encontrado
        - **500 Internal Server Error**: Error interno del servidor
        
        ### Equipo de Desarrollo
        
        Este proyecto ha sido desarrollado por un equipo multidisciplinario de ingenieros especializados en arquitectura de software y desarrollo de aplicaciones empresariales:
        
        - **Patricio Quintanilla** - *Arquitecto de Software Senior*
        - **Frank Vogt** - *Ingeniero de Desarrollo Full-Stack*
        - **Matías Román** - *Especialista en Integración de Sistemas*
        
        ---
        
        *Documentación técnica generada automáticamente mediante OpenAPI 3.0 Specification*
      `,
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@cuentasclaras.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.cuentasclaras.com',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT en el formato: Bearer {token}'
        }
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
                    example: 'Token no válido'
                  }
                }
              }
            }
          }
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
                    example: 'Recurso no encontrado'
                  }
                }
              }
            }
          }
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
                    example: 'Datos de entrada inválidos'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      },
      schemas: {
        Comunidad: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la comunidad'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la comunidad'
            },
            direccion: {
              type: 'string',
              description: 'Dirección de la comunidad'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono de contacto'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contacto'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'user', 'moderator'],
              description: 'Rol del usuario en el sistema'
            }
          }
        },
        Pago: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del pago'
            },
            monto: {
              type: 'number',
              format: 'decimal',
              description: 'Monto del pago'
            },
            fecha: {
              type: 'string',
              format: 'date',
              description: 'Fecha del pago'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'completado', 'fallido'],
              description: 'Estado del pago'
            },
            metodo_pago: {
              type: 'string',
              description: 'Método de pago utilizado'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            code: {
              type: 'integer',
              description: 'Código de error'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para login y gestión de sesiones'
      },
      {
        name: 'Comunidades',
        description: 'Gestión de comunidades residenciales'
      },
      {
        name: 'Edificios',
        description: 'Gestión de edificios y torres'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios y perfiles'
      },
      {
        name: 'Pagos',
        description: 'Gestión de pagos y transacciones'
      },
      {
        name: 'Gastos',
        description: 'Gestión de gastos y categorías'
      },
      {
        name: 'Proveedores',
        description: 'Gestión de proveedores y documentos'
      },
      {
        name: 'Amenidades',
        description: 'Gestión de amenidades y reservas'
      },
      {
        name: 'Multas',
        description: 'Gestión de multas y sanciones'
      },
      {
        name: 'Soporte',
        description: 'Endpoints de soporte y utilidades'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

// Configuración personalizada de Swagger UI
const swaggerUiOptions = {
  customCss: `
    /* Variables CSS personalizadas para Swagger UI */
    :root {
      --color-primary: #0d47a1;
      --color-secondary: #1976d2;
      --color-accent: #fd5d14;
      --color-success: #28a745;
      --color-warning: #ffc107;
      --color-danger: #dc3545;
      --color-info: #17a2b8;
      --color-light: #f8f9fa;
      --color-dark: #343a40;
      --color-muted: #6c757d;

      --font-family-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
      --font-size-base: 1rem;
      --font-size-sm: 0.875rem;
      --font-size-lg: 1.125rem;
      --font-size-xl: 1.25rem;
      --font-size-xxl: 2rem;

      --border-radius: 0.375rem;
      --border-radius-sm: 0.25rem;
      --border-radius-lg: 0.5rem;

      --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      --shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);

      --transition-base: all 0.15s ease-in-out;
      --transition-slow: all 0.3s ease-in-out;
    }

    /* Reset y base */
    .swagger-ui * {
      box-sizing: border-box;
    }

    /* Ocultar elementos no deseados */
    .swagger-ui .topbar { 
      display: none !important; 
    }

    /* Contenedor principal */
    .swagger-ui {
      font-family: var(--font-family-primary) !important;
      background-color: var(--color-light);
      color: var(--color-dark);
      line-height: 1.6;
    }

    /* Header y título */
    .swagger-ui .info {
      margin: 2rem 0;
      padding: 2rem;
      background: linear-gradient(135deg, #e3f2fd, #f8f9fa);
      border: 1px solid #e1f5fe;
      border-radius: var(--border-radius-lg);
      color: var(--color-dark);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .swagger-ui .info::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    }

    .swagger-ui .info hgroup.main {
      margin: 0 !important;
    }

    .swagger-ui .info .title {
      color: var(--color-primary) !important;
      font-size: var(--font-size-xxl) !important;
      font-weight: 700 !important;
      margin: 0 0 1rem 0 !important;
      text-shadow: none;
    }

    .swagger-ui .info .description {
      color: var(--color-dark) !important;
      margin: 1.5rem 0 !important;
      font-size: var(--font-size-base);
      line-height: 1.7;
    }

    .swagger-ui .info .description p {
      margin: 1rem 0 !important;
    }

    .swagger-ui .info .description ul {
      margin: 1rem 0 !important;
      padding-left: 1.5rem !important;
    }

    .swagger-ui .info .description li {
      margin: 0.5rem 0 !important;
    }

    .swagger-ui .info .description h3 {
      color: var(--color-primary) !important;
      font-weight: 600 !important;
      margin: 1.5rem 0 1rem 0 !important;
      font-size: var(--font-size-lg) !important;
    }

    /* Esquema de autorización */
    .swagger-ui .scheme-container {
      background: white !important;
      padding: 1.5rem !important;
      border-radius: var(--border-radius) !important;
      margin: 2rem 0 !important;
      border: 1px solid #e0e7ff !important;
      box-shadow: var(--shadow-sm) !important;
    }

    .swagger-ui .auth-wrapper {
      padding: 1rem;
      background: #f8fafc;
      border-radius: var(--border-radius);
      border: 1px solid #e2e8f0;
    }

    /* Tags de secciones */
    .swagger-ui .opblock-tag {
      border-bottom: 3px solid var(--color-primary) !important;
      margin: 2rem 0 1rem 0 !important;
      padding-bottom: 0.5rem !important;
      background: linear-gradient(90deg, rgba(13, 71, 161, 0.05), transparent) !important;
      border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0 !important;
    }

    .swagger-ui .opblock-tag-section h3 {
      color: var(--color-primary) !important;
      font-size: var(--font-size-xl) !important;
      font-weight: 600 !important;
      margin: 0 !important;
      padding: 1rem !important;
    }

    /* Bloques de operaciones */
    .swagger-ui .opblock {
      margin: 1rem 0 !important;
      border-radius: var(--border-radius) !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: var(--shadow-sm) !important;
      overflow: hidden !important;
      transition: var(--transition-base) !important;
    }

    .swagger-ui .opblock:hover {
      box-shadow: var(--shadow) !important;
      transform: translateY(-2px) !important;
    }

    /* Métodos HTTP con colores personalizados */
    .swagger-ui .opblock.opblock-get {
      border-left: 5px solid var(--color-success) !important;
    }

    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: var(--color-success) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .swagger-ui .opblock.opblock-post {
      border-left: 5px solid var(--color-primary) !important;
    }

    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: var(--color-primary) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .swagger-ui .opblock.opblock-put {
      border-left: 5px solid var(--color-warning) !important;
    }

    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: var(--color-warning) !important;
      color: var(--color-dark) !important;
      font-weight: 600 !important;
    }

    .swagger-ui .opblock.opblock-delete {
      border-left: 5px solid var(--color-danger) !important;
    }

    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: var(--color-danger) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .swagger-ui .opblock.opblock-patch {
      border-left: 5px solid var(--color-info) !important;
    }

    .swagger-ui .opblock.opblock-patch .opblock-summary-method {
      background: var(--color-info) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    /* Resumen de operaciones */
    .swagger-ui .opblock-summary {
      padding: 1rem 1.5rem !important;
      background: white !important;
      transition: var(--transition-base) !important;
    }

    .swagger-ui .opblock-summary:hover {
      background: #f8fafc !important;
    }

    .swagger-ui .opblock-summary-path {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
      font-size: var(--font-size-sm) !important;
      font-weight: 600 !important;
    }

    .swagger-ui .opblock-summary-description {
      color: var(--color-muted) !important;
      font-size: var(--font-size-sm) !important;
      margin-top: 0.5rem !important;
    }

    /* Contenido expandido */
    .swagger-ui .opblock-body {
      background: #f8fafc !important;
      border-top: 1px solid #e2e8f0 !important;
    }

    /* Parámetros */
    .swagger-ui .parameters-col_description p,
    .swagger-ui .response-col_description p {
      margin: 0.5rem 0 !important;
      font-size: var(--font-size-sm) !important;
      line-height: 1.5 !important;
    }

    .swagger-ui table thead tr th {
      background: var(--color-primary) !important;
      color: white !important;
      font-weight: 600 !important;
      padding: 1rem !important;
      border: none !important;
    }

    .swagger-ui table tbody tr td {
      padding: 1rem !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }

    /* Botones */
    .swagger-ui .btn {
      border-radius: var(--border-radius) !important;
      font-weight: 600 !important;
      padding: 0.75rem 1.5rem !important;
      transition: var(--transition-base) !important;
      text-transform: none !important;
      font-size: var(--font-size-sm) !important;
    }

    .swagger-ui .btn.execute {
      background: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
      color: white !important;
    }

    .swagger-ui .btn.execute:hover {
      background: var(--color-secondary) !important;
      border-color: var(--color-secondary) !important;
      transform: translateY(-1px) !important;
      box-shadow: var(--shadow) !important;
    }

    .swagger-ui .btn.clear {
      background: var(--color-muted) !important;
      border-color: var(--color-muted) !important;
      color: white !important;
    }

    .swagger-ui .btn.clear:hover {
      background: var(--color-dark) !important;
      border-color: var(--color-dark) !important;
    }

    /* Inputs y formularios */
    .swagger-ui input[type="text"],
    .swagger-ui input[type="password"],
    .swagger-ui input[type="email"],
    .swagger-ui textarea,
    .swagger-ui select {
      border: 1px solid #d1d5db !important;
      border-radius: var(--border-radius) !important;
      padding: 0.75rem !important;
      font-size: var(--font-size-sm) !important;
      transition: var(--transition-base) !important;
    }

    .swagger-ui input:focus,
    .swagger-ui textarea:focus,
    .swagger-ui select:focus {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.1) !important;
      outline: none !important;
    }

    /* Código y responses */
    .swagger-ui .highlight-code {
      background: #1f2937 !important;
      border-radius: var(--border-radius) !important;
      padding: 1.5rem !important;
    }

    .swagger-ui .highlight-code pre {
      color: #f9fafb !important;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
      font-size: var(--font-size-sm) !important;
      line-height: 1.5 !important;
    }

    /* Modelos/Schemas */
    .swagger-ui .model-box {
      background: white !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: var(--border-radius) !important;
      box-shadow: var(--shadow-sm) !important;
    }

    .swagger-ui .model-title {
      background: var(--color-light) !important;
      color: var(--color-primary) !important;
      font-weight: 600 !important;
      padding: 1rem !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }

    /* Animaciones suaves */
    .swagger-ui .opblock-body,
    .swagger-ui .opblock-summary {
      transition: var(--transition-base) !important;
    }

    /* Scrollbar personalizado */
    .swagger-ui ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .swagger-ui ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: var(--border-radius-sm);
    }

    .swagger-ui ::-webkit-scrollbar-thumb {
      background: var(--color-muted);
      border-radius: var(--border-radius-sm);
    }

    .swagger-ui ::-webkit-scrollbar-thumb:hover {
      background: var(--color-dark);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .swagger-ui .info {
        margin: 1rem;
        padding: 1.5rem;
      }

      .swagger-ui .info .title {
        font-size: var(--font-size-xl) !important;
      }

      .swagger-ui .opblock {
        margin: 0.5rem;
      }

      .swagger-ui .btn {
        font-size: 0.8rem !important;
        padding: 0.5rem 1rem !important;
      }
    }
  `,
  customSiteTitle: 'Cuentas Claras API - Documentación',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

function setupSwagger(app) {
  // Endpoint principal de documentación
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // Endpoint alternativo para la documentación
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
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
      health_check: '/health'
    });
  });
}

module.exports = { setupSwagger };

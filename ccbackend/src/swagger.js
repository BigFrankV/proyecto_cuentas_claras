const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Cuentas Claras API',
      version: '1.0.0',
      description: `
        ## API de Gestión para Comunidades Residenciales
        
        Sistema completo para la administración de comunidades, edificios y condominios.
        
        ### 🏢 Módulos Principales
        
        - **Comunidades y Edificios**: Gestión de estructuras, torres, unidades y amenidades
        - **Usuarios y Roles**: Autenticación JWT con sistema jerárquico de 7 niveles
        - **Finanzas**: Gastos comunes, pagos, conciliaciones y proveedores
        - **Operaciones**: Multas, consumos, medidores y soporte técnico
        
        ### 🔐 Autenticación
        
        La API usa **JSON Web Tokens (JWT)** para autenticación. Incluya el token en el header:
        \`\`\`
        Authorization: Bearer {token}
        \`\`\`
        
        ### ⚠️ Cambios Importantes (Breaking Changes)
        
        **Tablas Renombradas:**
        - \`cargo_unidad\` → \`cuenta_cobro_unidad\`
        - \`emision_gasto_comun\` → \`emision_gastos_comunes\`
        - \`ticket\` → \`solicitud_soporte\`
        - \`membresia_comunidad\` → \`usuario_comunidad_rol\`
        
        **Sistema de Roles (1-7):**
        1. Superadmin | 2. Admin | 3. Tesorero | 4. Secretario | 5. Directivo | 6. Propietario | 7. Residente
        
        **Endpoint /membresias:**
        - ❌ Antes: \`persona_id\` + \`rol\` (string)
        - ✅ Ahora: \`usuario_id\` + \`rol_id\` (integer)
        
        **JWT Token incluye:**
        - \`memberships[]\` con \`nivel_acceso\` por comunidad
        - \`roles[]\` con códigos de rol del usuario
        
        ---
        
        **Desarrollado por:** Patricio Quintanilla, Frank Vogt, Matías Román
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
            username: {
              type: 'string',
              description: 'Nombre de usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona asociada al usuario'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        Rol: {
          type: 'object',
          description: 'Rol del sistema con nivel de acceso jerárquico',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del rol'
            },
            codigo: {
              type: 'string',
              enum: ['superadmin', 'admin', 'comite', 'contador', 'conserje', 'propietario', 'residente'],
              description: 'Código identificador del rol'
            },
            nombre: {
              type: 'string',
              description: 'Nombre descriptivo del rol'
            },
            nivel_acceso: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description: 'Nivel jerárquico (1=máximo acceso, 7=mínimo acceso)'
            }
          }
        },
        Membresia: {
          type: 'object',
          description: 'Asignación de rol de usuario en una comunidad',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la membresía'
            },
            comunidad_id: {
              type: 'integer',
              description: 'ID de la comunidad'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del usuario'
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona (derivado de usuario)'
            },
            rol: {
              type: 'string',
              description: 'Código del rol asignado'
            },
            rol_nombre: {
              type: 'string',
              description: 'Nombre del rol'
            },
            nivel_acceso: {
              type: 'integer',
              description: 'Nivel de acceso jerárquico'
            },
            desde: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio de la membresía'
            },
            hasta: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Fecha de fin de la membresía (null si indefinida)'
            },
            activo: {
              type: 'boolean',
              description: 'Si la membresía está activa'
            }
          }
        },
        JWTToken: {
          type: 'object',
          description: 'Token JWT con información del usuario autenticado',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT firmado'
            }
          }
        },
        JWTPayload: {
          type: 'object',
          description: 'Contenido decodificado del token JWT',
          properties: {
            sub: {
              type: 'integer',
              description: 'ID del usuario (subject)'
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario'
            },
            persona_id: {
              type: 'integer',
              description: 'ID de la persona asociada'
            },
            roles: {
              type: 'array',
              description: 'Array de códigos de roles del usuario',
              items: {
                type: 'string'
              }
            },
            comunidad_id: {
              type: 'integer',
              nullable: true,
              description: 'ID de la primera comunidad del usuario'
            },
            memberships: {
              type: 'array',
              description: 'Lista de membresías del usuario por comunidad',
              items: {
                type: 'object',
                properties: {
                  comunidadId: {
                    type: 'integer'
                  },
                  rol: {
                    type: 'string'
                  },
                  nivel_acceso: {
                    type: 'integer'
                  }
                }
              }
            },
            is_superadmin: {
              type: 'boolean',
              description: 'DEPRECADO: usar sistema de roles en su lugar',
              deprecated: true
            },
            iat: {
              type: 'integer',
              description: 'Timestamp de emisión del token'
            },
            exp: {
              type: 'integer',
              description: 'Timestamp de expiración del token'
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

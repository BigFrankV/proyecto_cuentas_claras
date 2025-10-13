/**
 * @swagger
 * tags:
 *   - name: Gastos
 *     description: Gestión completa de gastos de la comunidad
 * 
 * components:
 *   schemas:
 *     Gasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del gasto
 *         numero:
 *           type: string
 *           description: Número correlativo del gasto (ej. G2024-0001)
 *         comunidad_id:
 *           type: integer
 *           description: ID de la comunidad
 *         categoria_id:
 *           type: integer
 *           description: ID de la categoría de gasto
 *         centro_costo_id:
 *           type: integer
 *           nullable: true
 *           description: ID del centro de costo (opcional)
 *         documento_compra_id:
 *           type: integer
 *           nullable: true
 *           description: ID del documento de compra asociado
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del gasto (YYYY-MM-DD)
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del gasto en CLP
 *         glosa:
 *           type: string
 *           description: Descripción detallada del gasto
 *         extraordinario:
 *           type: boolean
 *           description: Indica si es un gasto extraordinario
 *         estado:
 *           type: string
 *           enum: [borrador, pendiente, aprobado, rechazado, pagado, anulado]
 *           description: Estado actual del gasto
 *         creado_por:
 *           type: integer
 *           description: ID de la persona que creó el gasto
 *         aprobado_por:
 *           type: integer
 *           nullable: true
 *           description: ID de la persona que aprobó el gasto
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         categoria_nombre:
 *           type: string
 *           description: Nombre de la categoría
 *         centro_costo_nombre:
 *           type: string
 *           description: Nombre del centro de costo
 *         creado_por_nombre:
 *           type: string
 *           description: Nombre completo del creador
 *         aprobado_por_nombre:
 *           type: string
 *           description: Nombre completo del aprobador
 * 
 *     GastoCreate:
 *       type: object
 *       required:
 *         - categoria_id
 *         - fecha
 *         - monto
 *         - glosa
 *       properties:
 *         categoria_id:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *         centro_costo_id:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         proveedor_id:
 *           type: integer
 *           nullable: true
 *           example: 12
 *         documento_compra_id:
 *           type: integer
 *           nullable: true
 *           example: 45
 *         fecha:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         monto:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           example: 150000.50
 *         glosa:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *           example: "Mantenimiento mensual de ascensores"
 *         extraordinario:
 *           type: boolean
 *           default: false
 *           example: false
 * 
 *     GastoUpdate:
 *       type: object
 *       properties:
 *         categoria_id:
 *           type: integer
 *           minimum: 1
 *         centro_costo_id:
 *           type: integer
 *           nullable: true
 *         fecha:
 *           type: string
 *           format: date
 *         monto:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *         glosa:
 *           type: string
 *           minLength: 3
 *           maxLength: 500
 *         extraordinario:
 *           type: boolean
 * 
 *     Aprobacion:
 *       type: object
 *       required:
 *         - decision
 *       properties:
 *         decision:
 *           type: string
 *           enum: [aprobado, rechazado]
 *           example: "aprobado"
 *         observaciones:
 *           type: string
 *           example: "Aprobado conforme a presupuesto"
 *         monto_aprobado:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: 150000.50
 * 
 *     Estadisticas:
 *       type: object
 *       properties:
 *         resumen:
 *           type: object
 *           properties:
 *             total_gastos:
 *               type: integer
 *             borradores:
 *               type: integer
 *             pendientes:
 *               type: integer
 *             aprobados:
 *               type: integer
 *             rechazados:
 *               type: integer
 *             pagados:
 *               type: integer
 *             anulados:
 *               type: integer
 *             monto_total:
 *               type: number
 *               format: float
 *             monto_mes_actual:
 *               type: number
 *               format: float
 *             monto_anio_actual:
 *               type: number
 *               format: float
 *             monto_extraordinarios:
 *               type: number
 *               format: float
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}:
 *   get:
 *     summary: Listar gastos de una comunidad
 *     description: Obtiene listado paginado de gastos con filtros opcionales. comunidadId = 0 para ver todos (solo superadmin)
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad (0 = todas las comunidades)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, pendiente, aprobado, rechazado, pagado, anulado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Buscar en glosa, categoría, número o creador
 *       - in: query
 *         name: ordenar
 *         schema:
 *           type: string
 *           enum: [fecha, monto, created_at, numero, estado]
 *           default: fecha
 *         description: Campo para ordenar
 *       - in: query
 *         name: direccion
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de gastos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gasto'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/stats:
 *   get:
 *     summary: Estadísticas de gastos
 *     description: Obtiene estadísticas y métricas de gastos para el dashboard
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Estadisticas'
 */

/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     summary: Obtener detalle de un gasto
 *     description: Obtiene información completa de un gasto específico incluyendo aprobaciones e historial
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Detalle del gasto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     gasto:
 *                       $ref: '#/components/schemas/Gasto'
 *                     aprobaciones:
 *                       type: array
 *                       items:
 *                         type: object
 *                     historial:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}:
 *   post:
 *     summary: Crear nuevo gasto
 *     description: Crea un nuevo gasto en estado borrador. Genera número correlativo automático.
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GastoCreate'
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Gasto'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/{id}:
 *   put:
 *     summary: Actualizar gasto
 *     description: Actualiza un gasto existente. Solo permite editar gastos en estado borrador o pendiente.
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GastoUpdate'
 *     responses:
 *       200:
 *         description: Gasto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Gasto'
 *       400:
 *         description: No se puede editar (estado no permitido)
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 * 
 *   delete:
 *     summary: Eliminar gasto
 *     description: Elimina un gasto. Solo permite eliminar gastos en estado borrador.
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Gasto eliminado exitosamente
 *       400:
 *         description: No se puede eliminar (estado no permitido)
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/{id}/aprobaciones:
 *   post:
 *     summary: Registrar aprobación o rechazo
 *     description: Registra la aprobación o rechazo de un gasto. Actualiza el estado automáticamente según las aprobaciones requeridas.
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Aprobacion'
 *     responses:
 *       200:
 *         description: Aprobación registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gasto_id:
 *                       type: integer
 *                     aprobadas:
 *                       type: integer
 *                     rechazadas:
 *                       type: integer
 *                     estado:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/{id}/anular:
 *   post:
 *     summary: Anular gasto
 *     description: Anula un gasto aprobado. No permite anular gastos incluidos en emisiones cerradas.
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Error en el monto registrado"
 *     responses:
 *       200:
 *         description: Gasto anulado exitosamente
 *       400:
 *         description: No se puede anular (incluido en emisión cerrada)
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /gastos/{id}/historial:
 *   get:
 *     summary: Historial de cambios del gasto
 *     description: Obtiene el historial completo de modificaciones de un gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       expenseId:
 *                         type: integer
 *                       field:
 *                         type: string
 *                       oldValue:
 *                         type: string
 *                       newValue:
 *                         type: string
 *                       changedAt:
 *                         type: string
 *                         format: date-time
 *                       userId:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 */

/**
 * @swagger
 * /gastos/{id}/aprobaciones:
 *   get:
 *     summary: Historial de aprobaciones
 *     description: Obtiene el historial de aprobaciones y rechazos de un gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Historial de aprobaciones obtenido exitosamente
 */

/**
 * @swagger
 * /gastos/{id}/archivos:
 *   get:
 *     summary: Archivos adjuntos del gasto
 *     description: Obtiene lista de todos los archivos adjuntos al gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Archivos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       storedName:
 *                         type: string
 *                       path:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 */

/**
 * @swagger
 * /gastos/{id}/emisiones:
 *   get:
 *     summary: Emisiones donde está incluido el gasto
 *     description: Obtiene información de las emisiones de gastos comunes donde está distribuido este gasto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Información de emisiones obtenida exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/por-categoria:
 *   get:
 *     summary: Gastos agrupados por categoría
 *     description: Obtiene estadísticas de gastos agrupados por categoría con filtros opcionales
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas por categoría obtenidas exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/por-proveedor:
 *   get:
 *     summary: Gastos agrupados por proveedor
 *     description: Obtiene estadísticas de gastos agrupados por proveedor
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Estadísticas por proveedor obtenidas exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/por-centro-costo:
 *   get:
 *     summary: Gastos agrupados por centro de costo
 *     description: Obtiene estadísticas de gastos agrupados por centro de costo
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas por centro de costo obtenidas exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/evolucion-temporal:
 *   get:
 *     summary: Evolución temporal de gastos
 *     description: Obtiene la evolución de gastos mes a mes
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Número de meses hacia atrás
 *     responses:
 *       200:
 *         description: Evolución temporal obtenida exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/top-gastos:
 *   get:
 *     summary: Top gastos mayores
 *     description: Obtiene los gastos de mayor monto
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top gastos obtenidos exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/pendientes-aprobacion:
 *   get:
 *     summary: Gastos pendientes de aprobación
 *     description: Obtiene gastos que están esperando aprobación
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos pendientes obtenidos exitosamente
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/alertas:
 *   get:
 *     summary: Alertas de gastos
 *     description: Obtiene alertas sobre gastos que requieren atención (pendientes, vencidos, sin documentos)
 *     tags: [Gastos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alertas obtenidas exitosamente
 */

module.exports = {};

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { upload, validateUploadContext, getFileInfo } = require('../upload');
const FileService = require('../services/fileService');
const { authenticate: authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Inicializar tabla de archivos solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  FileService.initializeFileTable().catch(console.error);
}

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Subir archivos
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               comunidadId:
 *                 type: integer
 *                 description: ID de la comunidad
 *               entityType:
 *                 type: string
 *                 enum: [personas, unidades, gastos, documentos, reportes]
 *                 description: Tipo de entidad
 *               entityId:
 *                 type: integer
 *                 description: ID de la entidad
 *               fileCategory:
 *                 type: string
 *                 description: Categoría del archivo
 *               description:
 *                 type: string
 *                 description: Descripción del archivo
 */
router.post('/upload', validateUploadContext, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se subieron archivos'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileInfo = getFileInfo(file, req);
        const fileId = await FileService.saveFileRecord(fileInfo);
        
        uploadedFiles.push({
          id: fileId,
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          category: fileInfo.category,
          url: `/api/files/${fileId}`
        });
      } catch (error) {
        console.error('Error procesando archivo:', error);
        // Limpiar archivo físico si falló el guardado
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo fallido:', unlinkError);
        }
      }
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} archivo(s) subido(s) correctamente`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error en upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Descargar archivo por ID
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo
 */
router.get('/:id', async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const comunidadId = req.user.comunidadId;

    const file = await FileService.getFileById(fileId, comunidadId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    // Verificar que el archivo existe físicamente
    try {
      await fs.access(file.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el sistema de archivos'
      });
    }

    // Configurar headers para la descarga
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    // Enviar archivo
    res.sendFile(path.resolve(file.file_path));

  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Listar archivos por contexto
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Tipo de entidad
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *         description: ID de la entidad
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Categoría del archivo
 */
router.get('/', async (req, res) => {
  try {
    const comunidadId = req.user.comunidadId;
    const { entityType, entityId, category } = req.query;

    const files = await FileService.getFilesByContext(
      comunidadId,
      entityType,
      entityId ? parseInt(entityId) : null,
      category
    );

    // Agregar URL de descarga a cada archivo
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `/api/files/${file.id}`,
      downloadUrl: `/api/files/${file.id}`,
      previewUrl: file.mimetype.startsWith('image/') ? `/api/files/${file.id}` : null
    }));

    res.json({
      success: true,
      files: filesWithUrls
    });

  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Eliminar archivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo
 */
router.delete('/:id', async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const comunidadId = req.user.comunidadId;
    const userId = req.user.id;

    const file = await FileService.getFileById(fileId, comunidadId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    await FileService.deleteFile(fileId, comunidadId, userId);

    res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/files/stats:
 *   get:
 *     summary: Obtener estadísticas de archivos
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', async (req, res) => {
  try {
    const comunidadId = req.user.comunidadId;
    const stats = await FileService.getFileStats(comunidadId);

    res.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: Math.round(stats.total_size / (1024 * 1024) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/files/cleanup:
 *   post:
 *     summary: Limpiar archivos huérfanos
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 */
router.post('/cleanup', async (req, res) => {
  try {
    const comunidadId = req.user.comunidadId;
    
    // Solo administradores pueden ejecutar limpieza
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ejecutar esta acción'
      });
    }

    await FileService.cleanOrphanFiles(comunidadId);

    res.json({
      success: true,
      message: 'Limpieza de archivos completada'
    });

  } catch (error) {
    console.error('Error en limpieza:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;


// =========================================
// ENDPOINTS DE ARCHIVOS (FILES)
// =========================================

// // SUBIDA Y DESCARGA
// POST: /files/upload
// GET: /files/:id

// // LISTADO Y GESTIÓN
// GET: /files
// DELETE: /files/:id

// // UTILIDADES Y ESTADÍSTICAS
// GET: /files/stats
// POST: /files/cleanup
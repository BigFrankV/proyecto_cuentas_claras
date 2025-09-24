const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  archives: ['.zip', '.rar', '.7z']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Función para crear estructura de directorios
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }
};

// Configuración de almacenamiento dinámico
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const baseDir = process.env.UPLOAD_DIR || 'uploads';
    
    // Extraer información del contexto
    const { comunidadId, entityType, entityId, fileCategory } = req.body;
    
    if (!comunidadId) {
      return cb(new Error('comunidadId es requerido'), null);
    }

    // Construir ruta según el tipo de entidad
    let destinationPath = path.join(baseDir, 'comunidades', comunidadId.toString());
    
    if (entityType && entityId) {
      destinationPath = path.join(destinationPath, entityType, entityId.toString());
      
      if (fileCategory) {
        destinationPath = path.join(destinationPath, fileCategory);
      }
    } else if (fileCategory) {
      destinationPath = path.join(destinationPath, fileCategory);
    }

    // Crear directorio si no existe
    await ensureDirectoryExists(destinationPath);
    
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    // Sanitizar nombre del archivo
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(originalName);
    const basename = path.basename(originalName, ext);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    const filename = `${basename}_${timestamp}_${randomStr}${ext}`;
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [
    ...ALLOWED_FILE_TYPES.images,
    ...ALLOWED_FILE_TYPES.documents,
    ...ALLOWED_FILE_TYPES.archives
  ];
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}`), false);
  }
};

// Configuración principal de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Máximo 10 archivos por request
  }
});

// Middleware para validar contexto de subida
const validateUploadContext = (req, res, next) => {
  const { comunidadId, entityType, entityId } = req.body;
  
  if (!comunidadId) {
    return res.status(400).json({
      error: 'comunidadId es requerido'
    });
  }

  // Validar tipos de entidad permitidos
  const validEntityTypes = ['personas', 'unidades', 'gastos', 'documentos', 'reportes'];
  if (entityType && !validEntityTypes.includes(entityType)) {
    return res.status(400).json({
      error: `Tipo de entidad no válido: ${entityType}`
    });
  }

  next();
};

// Función para obtener información del archivo
const getFileInfo = (file, req) => {
  const { comunidadId, entityType, entityId, fileCategory, description } = req.body;
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    comunidadId: parseInt(comunidadId),
    entityType: entityType || null,
    entityId: entityId ? parseInt(entityId) : null,
    category: fileCategory || 'general',
    description: description || null,
    uploadedAt: new Date(),
    uploadedBy: req.user?.id || null
  };
};

module.exports = {
  upload,
  validateUploadContext,
  getFileInfo,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};

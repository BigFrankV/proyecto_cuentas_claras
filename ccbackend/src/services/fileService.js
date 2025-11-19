const fs = require('fs').promises;
const path = require('path');
const db = require('../db');

class FileService {
  // Crear tabla de archivos si no existe
  static async initializeFileTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS archivos (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          original_name VARCHAR(255) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          mimetype VARCHAR(100) NOT NULL,
          comunidad_id BIGINT,
          entity_type VARCHAR(50),
          entity_id BIGINT,
          category VARCHAR(100) DEFAULT 'general',
          description TEXT,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          uploaded_by BIGINT,
          is_active BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE CASCADE,
          INDEX idx_comunidad_entity (comunidad_id, entity_type, entity_id),
          INDEX idx_category (category),
          INDEX idx_uploaded_at (uploaded_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Tabla archivos inicializada correctamente');

      // Migrate existing table if it exists with NOT NULL constraint
      await this.migrateFileTable();
    } catch (error) {
      console.error('Error inicializando tabla archivos:', error);
      throw error;
    }
  }

  // Migrar tabla archivos para permitir NULL en comunidad_id
  static async migrateFileTable() {
    try {
      // Check if the table exists
      const [tables] = await db.query(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "archivos"'
      );

      if (tables.length === 0) {
        console.log('Tabla archivos no existe, se creará durante inicialización');
        return;
      }

      // Check the column definition
      const [columns] = await db.query(
        `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'archivos' AND COLUMN_NAME = 'comunidad_id'`
      );

      if (columns.length > 0 && columns[0].IS_NULLABLE === 'NO') {
        console.log('Migrando comunidad_id a nullable...');
        
        // Drop foreign key first
        const [constraints] = await db.query(
          `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'archivos' 
           AND COLUMN_NAME = 'comunidad_id' AND REFERENCED_TABLE_NAME IS NOT NULL`
        );

        if (constraints.length > 0) {
          const constraintName = constraints[0].CONSTRAINT_NAME;
          await db.query(`ALTER TABLE archivos DROP FOREIGN KEY ${constraintName}`);
          console.log(`Foreign key ${constraintName} eliminada`);
        }

        // Modify column to allow NULL
        await db.query(
          `ALTER TABLE archivos MODIFY COLUMN comunidad_id BIGINT NULL`
        );

        // Re-add foreign key
        await db.query(
          `ALTER TABLE archivos ADD CONSTRAINT fk_archivos_comunidad 
           FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE CASCADE`
        );

        console.log('Tabla archivos migrada exitosamente');
      }
    } catch (error) {
      // Silently handle migration errors - table might not exist or already be correct
      console.log('Nota: No se requiere migración de tabla archivos:', error.message);
    }
  }

  // Guardar información del archivo en la base de datos
  static async saveFileRecord(fileInfo) {
    try {
      const [result] = await db.query(
        `
        INSERT INTO archivos (
          original_name, filename, file_path, file_size, mimetype,
          comunidad_id, entity_type, entity_id, category, description,
          uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          fileInfo.originalName,
          fileInfo.filename,
          fileInfo.path,
          fileInfo.size,
          fileInfo.mimetype,
          fileInfo.comunidadId,
          fileInfo.entityType,
          fileInfo.entityId,
          fileInfo.category,
          fileInfo.description,
          fileInfo.uploadedBy,
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error guardando registro de archivo:', error);
      throw error;
    }
  }

  // Obtener archivos por contexto
  static async getFilesByContext(
    comunidadId,
    entityType = null,
    entityId = null,
    category = null
  ) {
    try {
      let query = `
        SELECT 
          id, original_name, filename, file_path, file_size, mimetype,
          comunidad_id, entity_type, entity_id, category, description,
          uploaded_at, uploaded_by, is_active
        FROM archivos 
        WHERE comunidad_id = ? AND is_active = TRUE
      `;

      const replacements = [comunidadId];

      if (entityType) {
        query += ` AND entity_type = ?`;
        replacements.push(entityType);
      }

      if (entityId) {
        query += ` AND entity_id = ?`;
        replacements.push(entityId);
      }

      if (category) {
        query += ` AND category = ?`;
        replacements.push(category);
      }

      query += ` ORDER BY uploaded_at DESC`;

      const [files] = await db.query(query, replacements);
      return files;
    } catch (error) {
      console.error('Error obteniendo archivos:', error);
      throw error;
    }
  }

  // Obtener un archivo específico
  static async getFileById(fileId, comunidadId) {
    try {
      const [files] = await db.query(
        `
        SELECT * FROM archivos 
        WHERE id = ? AND (
          comunidad_id = ? OR 
          comunidad_id IS NULL OR 
          category = 'perfil'
        ) AND is_active = TRUE
      `,
        [fileId, comunidadId]
      );

      return files[0] || null;
    } catch (error) {
      console.error('Error obteniendo archivo:', error);
      throw error;
    }
  }

  // Eliminar archivo (soft delete)
  static async deleteFile(fileId, comunidadId, userId) {
    try {
      // Marcar como inactivo en la base de datos
      await db.query(
        `
        UPDATE archivos 
        SET is_active = FALSE, updated_at = NOW(), updated_by = ?
        WHERE id = ? AND comunidad_id = ?
      `,
        [userId, fileId, comunidadId]
      );

      return true;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  // Eliminar archivo físicamente (usar con precaución)
  static async deleteFilePhysically(fileId, comunidadId) {
    try {
      const file = await this.getFileById(fileId, comunidadId);
      if (!file) {
        throw new Error('Archivo no encontrado');
      }

      // Eliminar archivo físico
      await fs.unlink(file.file_path);

      // Eliminar registro de la base de datos
      await db.query(
        `
        DELETE FROM archivos WHERE id = ? AND comunidad_id = ?
      `,
        [fileId, comunidadId]
      );

      return true;
    } catch (error) {
      console.error('Error eliminando archivo físicamente:', error);
      throw error;
    }
  }

  // Obtener estadísticas de archivos
  static async getFileStats(comunidadId) {
    try {
      const [stats] = await db.query(
        `
        SELECT 
          COUNT(*) as total_files,
          SUM(file_size) as total_size,
          COUNT(CASE WHEN entity_type = 'personas' THEN 1 END) as personas_files,
          COUNT(CASE WHEN entity_type = 'unidades' THEN 1 END) as unidades_files,
          COUNT(CASE WHEN entity_type = 'gastos' THEN 1 END) as gastos_files,
          COUNT(CASE WHEN category = 'avatar' THEN 1 END) as avatars,
          COUNT(CASE WHEN category = 'documentos' THEN 1 END) as documentos,
          COUNT(CASE WHEN category = 'comprobantes' THEN 1 END) as comprobantes
        FROM archivos 
        WHERE comunidad_id = ? AND is_active = TRUE
      `,
        [comunidadId]
      );

      return stats[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Limpiar archivos huérfanos (archivos sin registro en BD)
  static async cleanOrphanFiles(comunidadId) {
    try {
      const baseDir = process.env.UPLOAD_DIR || 'uploads';
      const comunidadDir = path.join(
        baseDir,
        'comunidades',
        comunidadId.toString()
      );

      // Obtener archivos registrados en BD
      const [registeredFiles] = await db.query(
        `
        SELECT filename FROM archivos WHERE comunidad_id = ? AND is_active = TRUE
      `,
        [comunidadId]
      );

      const registeredFilenames = new Set(
        registeredFiles.map((f) => f.filename)
      );

      // Función recursiva para limpiar directorios
      const cleanDirectory = async (dirPath) => {
        try {
          const items = await fs.readdir(dirPath, { withFileTypes: true });

          for (const item of items) {
            const itemPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
              await cleanDirectory(itemPath);
            } else if (item.isFile() && !registeredFilenames.has(item.name)) {
              console.log(`Eliminando archivo huérfano: ${itemPath}`);
              await fs.unlink(itemPath);
            }
          }
        } catch (error) {
          console.error(`Error limpiando directorio ${dirPath}:`, error);
        }
      };

      await cleanDirectory(comunidadDir);
      console.log(
        `Limpieza de archivos huérfanos completada para comunidad ${comunidadId}`
      );
    } catch (error) {
      console.error('Error en limpieza de archivos huérfanos:', error);
      throw error;
    }
  }
}

module.exports = FileService;

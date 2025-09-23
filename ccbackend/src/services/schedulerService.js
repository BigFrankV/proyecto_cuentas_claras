const cron = require('node-cron');
const indicadoresService = require('./indicadoresService');
const logger = require('../logger');

class SchedulerService {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
  }

  /**
   * Inicia todos los cron jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler ya está ejecutándose');
      return;
    }

    logger.info('🕐 Iniciando scheduler de indicadores...');

    // Sincronización diaria a las 8:00 AM
    this.tasks.set('daily-sync', cron.schedule('0 8 * * *', async () => {
      logger.info('⏰ Ejecutando sincronización diaria programada');
      try {
        await indicadoresService.sincronizar();
      } catch (error) {
        logger.error('Error en sincronización diaria:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Santiago"
    }));

    // Sincronización de respaldo a las 2:00 PM (por si la primera falla)
    this.tasks.set('backup-sync', cron.schedule('0 14 * * *', async () => {
      logger.info('⏰ Ejecutando sincronización de respaldo');
      try {
        // Verificar si ya se sincronizó hoy
        const today = new Date().toISOString().split('T')[0];
        const hasDataToday = await this.checkDataForDate(today);
        
        if (!hasDataToday) {
          logger.info('No hay datos para hoy, ejecutando sincronización...');
          await indicadoresService.sincronizar();
        } else {
          logger.info('Ya hay datos para hoy, omitiendo sincronización de respaldo');
        }
      } catch (error) {
        logger.error('Error en sincronización de respaldo:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Santiago"
    }));

    // Verificación de salud cada hora (solo logs)
    this.tasks.set('health-check', cron.schedule('0 * * * *', async () => {
      try {
        const stats = await this.getDataStats();
        logger.info(`📊 Estadísticas de datos: UF: ${stats.uf_count} registros, UTM: ${stats.utm_count} registros`);
      } catch (error) {
        logger.error('Error en verificación de salud:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Santiago"
    }));

    // Limpieza de datos antiguos - primer día del mes a las 3:00 AM
    this.tasks.set('cleanup', cron.schedule('0 3 1 * *', async () => {
      logger.info('🧹 Ejecutando limpieza de datos antiguos');
      try {
        await this.cleanupOldData();
      } catch (error) {
        logger.error('Error en limpieza de datos:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Santiago"
    }));

    // Iniciar todas las tareas
    this.tasks.forEach((task, name) => {
      task.start();
      logger.info(`✅ Tarea '${name}' programada`);
    });

    this.isRunning = true;
    logger.info('🚀 Scheduler iniciado correctamente');
  }

  /**
   * Detiene todos los cron jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler no está ejecutándose');
      return;
    }

    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`⏹️ Tarea '${name}' detenida`);
    });

    this.isRunning = false;
    logger.info('🛑 Scheduler detenido');
  }

  /**
   * Verifica si hay datos para una fecha específica
   */
  async checkDataForDate(fecha) {
    const db = require('../db');
    
    try {
      const [ufRows] = await db.query(
        'SELECT COUNT(*) as count FROM uf_valor WHERE fecha = ?', 
        [fecha]
      );
      
      const [utmRows] = await db.query(
        'SELECT COUNT(*) as count FROM utm_valor WHERE fecha = ?', 
        [fecha]
      );
      
      return ufRows[0].count > 0 || utmRows[0].count > 0;
    } catch (error) {
      logger.error('Error verificando datos:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de datos
   */
  async getDataStats() {
    const db = require('../db');
    
    try {
      const [ufCount] = await db.query('SELECT COUNT(*) as count FROM uf_valor');
      const [utmCount] = await db.query('SELECT COUNT(*) as count FROM utm_valor');
      const [lastUF] = await db.query('SELECT fecha, valor FROM uf_valor ORDER BY fecha DESC LIMIT 1');
      const [lastUTM] = await db.query('SELECT fecha, valor FROM utm_valor ORDER BY fecha DESC LIMIT 1');
      
      return {
        uf_count: ufCount[0].count,
        utm_count: utmCount[0].count,
        last_uf: lastUF[0] || null,
        last_utm: lastUTM[0] || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Limpia datos antiguos (más de 2 años)
   */
  async cleanupOldData() {
    const db = require('../db');
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    try {
      const [ufResult] = await db.query(
        'DELETE FROM uf_valor WHERE fecha < ?', 
        [cutoffDateStr]
      );
      
      const [utmResult] = await db.query(
        'DELETE FROM utm_valor WHERE fecha < ?', 
        [cutoffDateStr]
      );
      
      const [otrosResult] = await db.query(
        'DELETE FROM otros_indicadores WHERE fecha < ?', 
        [cutoffDateStr]
      );
      
      logger.info(`🧹 Limpieza completada: UF: ${ufResult.affectedRows}, UTM: ${utmResult.affectedRows}, Otros: ${otrosResult.affectedRows} registros eliminados`);
      
      return {
        uf_deleted: ufResult.affectedRows,
        utm_deleted: utmResult.affectedRows,
        otros_deleted: otrosResult.affectedRows,
        cutoff_date: cutoffDateStr
      };
    } catch (error) {
      logger.error('Error en limpieza de datos:', error);
      throw error;
    }
  }

  /**
   * Obtiene información del estado del scheduler
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      tasksCount: this.tasks.size,
      tasks: Array.from(this.tasks.keys()),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Ejecuta una sincronización manual
   */
  async runManualSync() {
    logger.info('🔄 Ejecutando sincronización manual...');
    try {
      const result = await indicadoresService.sincronizar();
      logger.info('✅ Sincronización manual completada');
      return result;
    } catch (error) {
      logger.error('❌ Error en sincronización manual:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();
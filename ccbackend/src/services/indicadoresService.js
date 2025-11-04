const axios = require('axios');
const db = require('../db');
const logger = require('../logger');

class IndicadoresService {
  constructor() {
    this.apiUrl = 'https://mindicador.cl/api';
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 segundos
  }

  /**
   * Obtiene datos de la API de mindicador.cl con reintentos
   */
  async fetchIndicadores() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(this.apiUrl, {
          timeout: 10000, // 10 segundos timeout
          headers: {
            'User-Agent': 'CuentasClaras/1.0.0',
          },
        });

        logger.info('Datos obtenidos exitosamente de mindicador.cl');
        return response.data;
      } catch (error) {
        logger.warn(
          `Intento ${attempt}/${this.maxRetries} fallido:`,
          error.message
        );

        if (attempt === this.maxRetries) {
          throw new Error(
            `Error al obtener datos después de ${this.maxRetries} intentos: ${error.message}`
          );
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt)
        );
      }
    }
  }

  /**
   * Actualiza los valores de UF en la base de datos
   */
  async updateUF(ufData) {
    if (!ufData || !ufData.valor || !ufData.fecha) {
      throw new Error('Datos de UF incompletos');
    }

    const fecha = new Date(ufData.fecha).toISOString().split('T')[0];
    const valor = parseFloat(ufData.valor);

    const query = `
      INSERT INTO uf_valor (fecha, valor) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE 
        valor = VALUES(valor)
    `;

    try {
      await db.query(query, [fecha, valor]);
      logger.info(
        `UF actualizada: ${fecha} = $${valor.toLocaleString('es-CL')}`
      );
      return { fecha, valor, updated: true };
    } catch (error) {
      logger.error('Error actualizando UF:', error);
      throw error;
    }
  }

  /**
   * Actualiza los valores de UTM en la base de datos
   */
  async updateUTM(utmData) {
    if (!utmData || !utmData.valor || !utmData.fecha) {
      throw new Error('Datos de UTM incompletos');
    }

    const fecha = new Date(utmData.fecha).toISOString().split('T')[0];
    const valor = parseFloat(utmData.valor);

    const query = `
      INSERT INTO utm_valor (fecha, valor) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE 
        valor = VALUES(valor)
    `;

    try {
      await db.query(query, [fecha, valor]);
      logger.info(
        `UTM actualizada: ${fecha} = $${valor.toLocaleString('es-CL')}`
      );
      return { fecha, valor, updated: true };
    } catch (error) {
      logger.error('Error actualizando UTM:', error);
      throw error;
    }
  }

  /**
   * Actualiza otros indicadores (dólar, euro, etc.)
   */
  async updateOtrosIndicadores(data) {
    const indicadores = ['dolar', 'euro', 'ipc', 'tpm'];
    const results = [];

    for (const indicador of indicadores) {
      if (data[indicador] && data[indicador].valor !== undefined) {
        try {
          const indicadorData = data[indicador];
          const fecha = new Date(indicadorData.fecha)
            .toISOString()
            .split('T')[0];
          const valor = parseFloat(indicadorData.valor);

          const query = `
            INSERT INTO otros_indicadores (codigo, nombre, fecha, valor, unidad_medida) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              valor = VALUES(valor), 
              nombre = VALUES(nombre),
              unidad_medida = VALUES(unidad_medida)
          `;

          await db.query(query, [
            indicadorData.codigo,
            indicadorData.nombre,
            fecha,
            valor,
            indicadorData.unidad_medida,
          ]);

          results.push({ codigo: indicador, fecha, valor, updated: true });
          logger.info(
            `${indicador.toUpperCase()} actualizado: ${fecha} = ${valor}`
          );
        } catch (error) {
          logger.error(`Error actualizando ${indicador}:`, error);
          results.push({ codigo: indicador, error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Proceso completo de sincronización
   */
  async sincronizar() {
    const startTime = Date.now();
    const resultado = {
      timestamp: new Date().toISOString(),
      success: false,
      uf: null,
      utm: null,
      otros: [],
      errors: [],
      duration: 0,
    };

    try {
      logger.info('🔄 Iniciando sincronización de indicadores...');

      // Obtener datos de la API
      const data = await this.fetchIndicadores();

      // Actualizar UF
      if (data.uf) {
        resultado.uf = await this.updateUF(data.uf);
      }

      // Actualizar UTM
      if (data.utm) {
        resultado.utm = await this.updateUTM(data.utm);
      }

      // Actualizar otros indicadores
      resultado.otros = await this.updateOtrosIndicadores(data);

      resultado.success = true;
      resultado.duration = Date.now() - startTime;

      logger.info(`Sincronización completada en ${resultado.duration}ms`);

      return resultado;
    } catch (error) {
      resultado.errors.push(error.message);
      resultado.duration = Date.now() - startTime;

      logger.error('Error en sincronización:', error);
      throw error;
    }
  }

  /**
   * Obtiene el histórico de un indicador específico
   */
  async getHistorico(indicador, año) {
    const url = `${this.apiUrl}/${indicador}/${año}`;

    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: { 'User-Agent': 'CuentasClaras/1.0.0' },
      });

      return response.data;
    } catch (error) {
      logger.error(`Error obteniendo histórico de ${indicador}:`, error);
      throw error;
    }
  }

  /**
   * Sincronización inicial con datos históricos
   */
  async sincronizacionInicial() {
    logger.info('Iniciando sincronización inicial con datos históricos...');

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear]; // Último año y año actual

    for (const year of years) {
      try {
        // UF histórica
        const ufHistorico = await this.getHistorico('uf', year);
        if (ufHistorico.serie) {
          for (const item of ufHistorico.serie) {
            await this.updateUF(item);
          }
        }

        // UTM histórica
        const utmHistorico = await this.getHistorico('utm', year);
        if (utmHistorico.serie) {
          for (const item of utmHistorico.serie) {
            await this.updateUTM(item);
          }
        }

        logger.info(`Datos históricos de ${year} procesados`);

        // Pausa entre años para no sobrecargar la API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Error procesando año ${year}:`, error);
      }
    }

    logger.info('Sincronización inicial completada');
  }
}

module.exports = new IndicadoresService();

/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import moment from 'moment';
import Papa from 'papaparse';

export interface ExportData {
  [key: string]: any;
}

export interface ExportOptions {
  filename?: string;
  delimiter?: string;
  encoding?: string;
  headers?: string[];
}

class ExportService {
  /**
   * Exportar datos a CSV usando PapaParse (cliente)
   */
  exportToCSV(data: ExportData[], options: ExportOptions = {}) {
    const {
      filename = `reporte_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`,
      delimiter = ',',
      headers,
    } = options;

    try {
      // Configurar opciones de PapaParse
      const csvConfig = {
        delimiter,
        header: true,
        skipEmptyLines: true,
        columns: headers || Object.keys(data[0] || {}),
      };

      // Convertir a CSV
      const csv = Papa.unparse(data, csvConfig);

      // Crear blob y descargar
      const blob = new Blob([`\uFEFF${csv}`], {
        type: 'text/csv;charset=utf-8;',
      });

      this.downloadBlob(blob, filename);

      return { success: true, message: 'Archivo exportado exitosamente' };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exportando CSV:', error);
      return { success: false, message: 'Error al exportar archivo' };
    }
  }

  /**
   * Exportar reportes financieros
   */
  exportFinancialReport(reportData: any[], communityName: string) {
    const formattedData = reportData.map(item => ({
      Mes: moment(item.month).format('MMMM YYYY'),
      'Ingresos (CLP)': this.formatCurrency(item.ingresos),
      'Gastos (CLP)': this.formatCurrency(item.gastos),
      'Saldo (CLP)': this.formatCurrency(item.saldo),
      'Morosidad (%)': item.morosidad.toFixed(2),
    }));

    return this.exportToCSV(formattedData, {
      filename: `reporte_financiero_${this.sanitizeFilename(communityName)}_${moment().format('YYYY-MM-DD')}.csv`,
    });
  }

  /**
   * Exportar listado de gastos
   */
  exportGastosReport(gastos: any[], communityName: string) {
    const formattedData = gastos.map(gasto => ({
      Fecha: moment(gasto.fecha).format('DD/MM/YYYY'),
      'Categoría ID': gasto.categoria_id,
      Descripción: gasto.glosa,
      'Monto (CLP)': this.formatCurrency(gasto.monto),
      'ID Gasto': gasto.id,
    }));

    return this.exportToCSV(formattedData, {
      filename: `gastos_${this.sanitizeFilename(communityName)}_${moment().format('YYYY-MM-DD')}.csv`,
    });
  }

  /**
   * Exportar datos de morosidad
   */
  exportMorosidadReport(data: any[], communityName: string) {
    const formattedData = data.map(item => ({
      Unidad: item.unidad,
      Propietario: item.propietario,
      'Meses en Mora': item.mesesMora,
      'Deuda Total (CLP)': this.formatCurrency(item.deudaTotal),
      'Último Pago': item.ultimoPago
        ? moment(item.ultimoPago).format('DD/MM/YYYY')
        : 'Sin pagos',
      Estado: item.estado,
    }));

    return this.exportToCSV(formattedData, {
      filename: `morosidad_${this.sanitizeFilename(communityName)}_${moment().format('YYYY-MM-DD')}.csv`,
    });
  }

  /**
   * Descargar blob como archivo
   */
  private downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Formatear moneda chilena
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  }

  /**
   * Limpiar nombre de archivo
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Exportar desde el servidor (API call)
   */
  async exportFromServer(
    endpoint: string,
    params: any = {},
    filename?: string
  ) {
    try {
      const response = await fetch(`/api/export/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Error en la exportación del servidor');
      }

      const blob = await response.blob();
      const suggestedFilename =
        filename ||
        response.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          ?.replace(/"/g, '') ||
        `export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;

      this.downloadBlob(blob, suggestedFilename);

      return { success: true, message: 'Archivo exportado desde servidor' };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exportando desde servidor:', error);
      return { success: false, message: 'Error al exportar desde servidor' };
    }
  }
}

export default new ExportService();

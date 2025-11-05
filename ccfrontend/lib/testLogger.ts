// Logger personalizado para pruebas
// Proporciona logging estructurado con timestamps y contexto de prueba

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  testName?: string;
  message: string;
  data?: any;
}

class TestLogger {
  private logs: LogEntry[] = [];
  private isTestEnvironment = typeof jest !== 'undefined';

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    data?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      testName: this.isTestEnvironment
        ? (global as any).expect?.getState?.()?.currentTestName
        : undefined,
      message,
      data,
    };
  }

  private log(level: LogEntry['level'], message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);
    this.logs.push(entry);

    // Formato para consola
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
    const testInfo = entry.testName ? ` [${entry.testName}]` : '';
    const fullMessage = `${prefix}${testInfo}: ${message}`;

    // Mostrar en consola según el nivel
    switch (level) {
      case 'error':
        console.error(fullMessage, data || '');
        break;
      case 'warn':
        console.warn(fullMessage, data || '');
        break;
      case 'info':
        console.info(fullMessage, data || '');
        break;
      case 'debug':
        console.debug(fullMessage, data || '');
        break;
    }
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  // Método para capturar errores de promesas no manejadas
  catchUnhandledErrors() {
    if (this.isTestEnvironment) {
      process.on('unhandledRejection', (reason, promise) => {
        this.error('Unhandled Promise Rejection', { reason, promise });
      });

      process.on('uncaughtException', error => {
        this.error('Uncaught Exception', { error });
      });
    }
  }

  // Obtener todos los logs (útil para debugging)
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
  }

  // Obtener logs por nivel
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Obtener logs de errores
  getErrorLogs(): LogEntry[] {
    return this.getLogsByLevel('error');
  }
}

// Instancia singleton del logger
const testLogger = new TestLogger();

// Activar captura de errores no manejados en entorno de pruebas
testLogger.catchUnhandledErrors();

export default testLogger;
export { TestLogger };

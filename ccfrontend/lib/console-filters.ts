/* Filtros de consola mejorados para desarrollo */

// Función para filtrar mensajes de extensiones en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Lista de patrones a silenciar
  const SILENT_PATTERNS = [
    'chrome-extension://',
    'web_accessible_resources',
    'gpc.js',
    'contentScript.js',
    'The message port closed before a response was received',
    'jQuery.Deferred exception',
    'Cannot read properties of null',
    'Unchecked runtime.lastError',
    'Download the React DevTools',
    'Download the Apollo DevTools',
    'eofcbnmajmjmplflapaojjnihcjkigck', // ID de extensión específica
    'gomekmidlodglbbmalcneegieacbdmki', // ID de extensión específica
  ];

  // Función helper para verificar si un mensaje debe ser silenciado
  const shouldSilence = (message: string): boolean => {
    return SILENT_PATTERNS.some(pattern => message.includes(pattern));
  };

  // Interceptar console.error
  const originalError = console.error;
  console.error = function (...args) {
    const message = args.join(' ');
    if (shouldSilence(message)) {
      return; // Silenciar
    }
    originalError.apply(console, args);
  };

  // Interceptar console.warn
  const originalWarn = console.warn;
  console.warn = function (...args) {
    const message = args.join(' ');
    if (shouldSilence(message)) {
      return; // Silenciar
    }
    originalWarn.apply(console, args);
  };

  // Interceptar console.log para React DevTools y similares
  const originalLog = console.log;
  console.log = function (...args) {
    const message = args.join(' ');
    if (shouldSilence(message)) {
      return; // Silenciar
    }
    originalLog.apply(console, args);
  };

  // Interceptar errores no capturados
  window.addEventListener('error', function (event) {
    if (shouldSilence(event.message || '')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Interceptar promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    if (shouldSilence(event.reason?.toString() || '')) {
      event.preventDefault();
      return false;
    }
  });
}

export {};

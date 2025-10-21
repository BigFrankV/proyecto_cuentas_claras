// Declaraciones de tipos para módulos externos
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Tipos globales para extensiones del navegador
declare global {
  interface Window {
    // Propiedades que pueden ser añadidas por extensiones
    chrome?: any;
    gpc?: any;
  }
}

export {};

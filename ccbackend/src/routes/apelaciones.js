const express = require('express');
const router = express.Router();

const controller = require('../controllers/apelacionesController');
const { authenticate } = require('../middleware/auth');
const permisos = require('../middleware/apelacionesPermissions');

// Endpoints
router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);

// Crear (solo usuarios autenticados; el middleware canApelar opcional si existe)
if (permisos && permisos.canApelar) {
  router.post('/', authenticate, permisos.canApelar, controller.create);
} else {
  router.post('/', authenticate, controller.create);
}

// Actualizar (author o manager — control dentro del controller)
router.put('/:id', authenticate, controller.update);

// Resolver (solo managers)
if (permisos && permisos.canManageApelaciones) {
  router.post('/:id/resolver', authenticate, permisos.canManageApelaciones, controller.resolve);
} else {
  router.post('/:id/resolver', authenticate, controller.resolve);
}

module.exports = router;
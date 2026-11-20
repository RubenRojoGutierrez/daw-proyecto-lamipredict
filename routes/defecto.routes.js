const express = require('express');
const router = express.Router();
const defectoController = require('../controllers/defecto.controller');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

// Todas las rutas requieren autenticación (401 si no hay token)
router.use(authGuard);

// Lectura para cualquier usuario autenticado
router.get('/', defectoController.listarDefectos);
router.get('/:id', defectoController.obtenerDefecto);

// Escritura restringida a administradores (403 si es user)
router.post('/', roleGuard('admin'), defectoController.crearDefecto);
router.put('/:id', roleGuard('admin'), defectoController.actualizarDefecto);
router.delete('/:id', roleGuard('admin'), defectoController.eliminarDefecto);

module.exports = router;
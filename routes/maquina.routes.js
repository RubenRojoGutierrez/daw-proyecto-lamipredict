const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquina.controller');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

// Todas las rutas requieren estar autenticado (401 si no hay token)
router.use(authGuard);

// Lectura abierta a cualquier usuario autenticado (user y admin)
router.get('/', maquinaController.listarMaquinas);
router.get('/:id', maquinaController.obtenerMaquina);

// Escritura restringida solo a administradores (403 si es user)
router.post('/', roleGuard('admin'), maquinaController.crearMaquina);
router.put('/:id', roleGuard('admin'), maquinaController.actualizarMaquina);
router.delete('/:id', roleGuard('admin'), maquinaController.eliminarMaquina);

module.exports = router;
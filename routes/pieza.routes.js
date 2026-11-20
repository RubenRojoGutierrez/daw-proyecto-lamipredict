const express = require('express');
const router = express.Router();
const piezaController = require('../controllers/pieza.controller');
const authGuard = require('../middlewares/authGuard');

// Todas las rutas de piezas requieren estar autenticado (401 si no hay token)
router.use(authGuard);

router.get('/', piezaController.listarPiezas);
router.get('/:id', piezaController.obtenerPieza);
router.post('/', piezaController.crearPieza);
router.put('/:id', piezaController.actualizarPieza);
router.delete('/:id', piezaController.eliminarPieza);

module.exports = router;
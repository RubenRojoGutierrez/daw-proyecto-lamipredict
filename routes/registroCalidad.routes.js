const express = require('express');
const router = express.Router();
const registroCalidadController = require('../controllers/registroCalidad.controller');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

// Todas las rutas requieren autenticación (401 si no hay token)
router.use(authGuard);

// Operarios y administradores pueden consultar y registrar controles de calidad
router.get('/', registroCalidadController.listarRegistrosCalidad);
router.get('/:id', registroCalidadController.obtenerRegistroCalidad);
router.post('/', registroCalidadController.crearRegistroCalidad);

// Solo administradores pueden editar o borrar registros históricos (403 si es user)
router.put('/:id', roleGuard('admin'), registroCalidadController.actualizarRegistroCalidad);
router.delete('/:id', roleGuard('admin'), registroCalidadController.eliminarRegistroCalidad);

module.exports = router;
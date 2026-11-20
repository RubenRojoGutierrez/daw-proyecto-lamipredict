const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

// Solo administradores autenticados pueden gestionar usuarios
router.use(authGuard);
router.use(roleGuard('admin'));

router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.obtenerUsuario);
router.post('/', usuarioController.crearUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;
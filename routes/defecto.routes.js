const express = require('express');
const router = express.Router();
const defectoController = require('../controllers/defecto.controller');

router.post('/', defectoController.crearDefecto);

module.exports = router;
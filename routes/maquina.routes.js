const express = require('express');
const router = express.Router();
const maquinaController = require('../controllers/maquina.controller');

router.post('/', maquinaController.crearMaquina);

module.exports = router;
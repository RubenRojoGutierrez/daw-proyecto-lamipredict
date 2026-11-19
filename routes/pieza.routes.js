const express = require('express');
const router = express.Router();
const piezaController = require('../controllers/pieza.controller');

router.post('/', piezaController.crearPieza);

module.exports = router;
const express = require('express');
const router = express.Router();
const registroCalidadController = require('../controllers/registroCalidad.controller');

router.post('/', registroCalidadController.crearRegistroCalidad);

module.exports = router;
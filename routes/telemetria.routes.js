const express = require('express');
const router = express.Router();
const telemetriaController = require('../controllers/telemetria.controller');
const authGuard = require('../middlewares/authGuard');

router.get('/', telemetriaController.listarTelemetrias);
router.get('/ultimas', telemetriaController.obtenerUltimasLecturas);
router.post('/', telemetriaController.guardarTelemetria);
router.post('/', authGuard, telemetriaController.registrarTelemetria);

module.exports = router;
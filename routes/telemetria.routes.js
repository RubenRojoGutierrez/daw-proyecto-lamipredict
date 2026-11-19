const express = require('express');
const router = express.Router();

// Importamos a nuestro "técnico" del archivo que acabamos de hacer
const telemetriaController = require('../controllers/telemetria.controller');

// Le ponemos el cartel al desvío:
// Cuando alguien envíe un paquete POST a la dirección principal de este bloque,
// pásale el trabajo a la función 'guardarTelemetria' de nuestro controlador.
router.post('/', telemetriaController.guardarTelemetria);

// Lecturas recientes para verificar que la línea está guardando datos.
router.get('/ultimas', telemetriaController.obtenerUltimasLecturas);

// Exportamos esta tubería para que el cuadro eléctrico principal pueda conectarla
module.exports = router;
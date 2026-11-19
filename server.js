// 1. IMPORTACIÓN DE HERRAMIENTAS
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga las variables de tu archivo .env
const path = require('path');

// 2. INICIALIZACIÓN
const app = express();
const PORT = process.env.PORT || 3000;

// 3. MIDDLEWARES (Estaciones de control)
// Permite que un frontend externo hable con este servidor sin bloqueos de seguridad
app.use(cors()); 
// Parsea automáticamente el cuerpo de las peticiones HTTP convirtiéndolas a JSON
app.use(express.json()); 

// 4. RUTAS (El clasificador de la cinta)

// --- IMPORTACIÓN DE RUTAS ---
const telemetriaRoutes = require('./routes/telemetria.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const piezaRoutes = require('./routes/pieza.routes');
const defectoRoutes = require('./routes/defecto.routes');
const registroCalidadRoutes = require('./routes/registroCalidad.routes');
const maquinaRoutes = require('./routes/maquina.routes');

// --- CONEXIÓN DE ENDPOINTS (URLs) ---
app.use('/api/telemetria', telemetriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/piezas', piezaRoutes);
app.use('/api/defectos', defectoRoutes);
app.use('/api/calidad', registroCalidadRoutes);
app.use('/api/maquinas', maquinaRoutes);

// ---> RUTA BASE: Comprobación del motor <---
app.get('/', (req, res) => {
    res.json({ 
        estado: 'OK',
        mensaje: 'Servidor de LamiPredict funcionando al 100%' 
    });
});

// Creamos una ruta web para servir el Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 5. ENCENDIDO DEL MOTOR
app.listen(PORT, () => {
    console.log(`[LamiPredict] Servidor encendido y escuchando en el puerto ${PORT}`);
});
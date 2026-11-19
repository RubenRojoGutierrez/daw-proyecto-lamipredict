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
const authRoutes = require('./routes/auth.routes');
const { AppError, errorHandler } = require('./middlewares/errorHandler');

// --- CONEXIÓN DE ENDPOINTS (URLs) ---
app.use('/api/telemetria', telemetriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/piezas', piezaRoutes);
app.use('/api/defectos', defectoRoutes);
app.use('/api/calidad', registroCalidadRoutes);
app.use('/api/maquinas', maquinaRoutes);
app.use('/api/auth', authRoutes);

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
// Captura de rutas no existentes (404 Not Found en RFC 9457)
app.use((req, res, next) => {
    next(new AppError(404, 'Ruta No Encontrada', `No existe el endpoint ${req.originalUrl}`, 'https://api.lamipredict.es/errors/not-found'));
});

// Middleware global de errores (SIEMPRE el último)
app.use(errorHandler);

// 5. ENCENDIDO DEL MOTOR
app.listen(PORT, () => {
    console.log(`[LamiPredict] Servidor encendido y escuchando en el puerto ${PORT}`);
});
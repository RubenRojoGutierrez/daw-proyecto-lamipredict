const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearRegistroCalidad = async (req, res) => {
    try {
        const nuevoRegistro = await prisma.registroCalidad.create({
            data: {
                // id_registro se omite para que PostgreSQL lo asigne automáticamente
                id_pieza: req.body.id_pieza,       // Clave foránea
                id_defecto: req.body.id_defecto,   // Clave foránea
                gravedad: req.body.gravedad,
                observaciones: req.body.observaciones
            }
        });
        
        res.status(201).json({ 
            mensaje: 'Registro de calidad guardado correctamente', 
            datos: nuevoRegistro 
        });
        
    } catch (error) {
        console.error("Error al guardar el registro de calidad:", error);
        res.status(500).json({ error: 'Fallo interno al guardar el registro de calidad' });
    }
};

module.exports = { crearRegistroCalidad };
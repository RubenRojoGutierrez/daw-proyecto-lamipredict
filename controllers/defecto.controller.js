const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearDefecto = async (req, res) => {
    try {
        const nuevoDefecto = await prisma.defecto.create({
            data: {
                // id_defecto se omite para que PostgreSQL lo genere automáticamente
                nombre: req.body.nombre,
                descripcion: req.body.descripcion
            }
        });
        
        res.status(201).json({ 
            mensaje: 'Defecto registrado correctamente', 
            datos: nuevoDefecto 
        });
        
    } catch (error) {
        console.error("Error al registrar defecto:", error);
        res.status(500).json({ error: 'Fallo interno al registrar el defecto' });
    }
};

module.exports = { crearDefecto };
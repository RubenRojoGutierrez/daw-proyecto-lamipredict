const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearUsuario = async (req, res) => {
    try {
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                // id_usuario se omite para que PostgreSQL lo genere automáticamente
                nombre: req.body.nombre,
                email: req.body.email,
                password_hash: req.body.password_hash,
                rol: req.body.rol
            }
        });
        
        res.status(201).json({ 
            mensaje: 'Usuario registrado correctamente', 
            datos: nuevoUsuario 
        });
        
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: 'Fallo interno al registrar el usuario' });
    }
};

module.exports = { crearUsuario };
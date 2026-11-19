const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearMaquina = async (req, res) => {
    try {
        const nuevaMaquina = await prisma.maquina.create({
            data: {
                // id_maquina se genera solo
                nombre: req.body.nombre,
                seccion: req.body.seccion
            }
        });
        res.status(201).json({ mensaje: 'Máquina registrada', datos: nuevaMaquina });
    } catch (error) {
        console.error("Error al registrar máquina:", error);
        res.status(500).json({ error: 'Fallo al registrar la máquina' });
    }
};

module.exports = { crearMaquina };
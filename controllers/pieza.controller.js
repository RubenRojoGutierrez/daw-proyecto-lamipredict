const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearPieza = async (req, res) => {
    try {
        const nuevaPieza = await prisma.pieza.create({
            data: {
                id_pieza: req.body.id_pieza,
                id_usuario: req.body.id_usuario,
                programa_fabricacion: req.body.programa_fabricacion,
                numero_carro: req.body.numero_carro,
                lote_vidrio_base: req.body.lote_vidrio_base, // NUEVO
                lote_pvb: req.body.lote_pvb                  // NUEVO
            }
        });
        res.status(201).json({ mensaje: 'Pieza registrada', datos: nuevaPieza });
    } catch (error) {
        console.error("Error al registrar pieza:", error);
        res.status(500).json({ error: 'Fallo al registrar la pieza' });
    }
};

module.exports = { crearPieza };
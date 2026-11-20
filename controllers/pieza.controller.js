const { z } = require('zod');
const piezaService = require('../services/pieza.service');

const createPiezaSchema = z.object({
  id_pieza: z.string().min(3, 'El código de pieza debe tener al menos 3 caracteres.'),
  programa_fabricacion: z.number().int().positive('El programa debe ser un entero positivo.'),
  numero_carro: z.number().int().positive('El número de carro debe ser un entero positivo.'),
  lote_vidrio_base: z.string().min(2, 'El lote de vidrio base es obligatorio.'),
  lote_pvb: z.string().min(2, 'El lote de PVB es obligatorio.'),
});

// Para actualizar, no dejamos cambiar el id_pieza y hacemos el resto opcionales
const updatePiezaSchema = createPiezaSchema.omit({ id_pieza: true }).partial();

async function listarPiezas(req, res, next) {
  try {
    const piezas = await piezaService.listarPiezas(req.user);
    res.status(200).json(piezas);
  } catch (error) {
    next(error);
  }
}

async function obtenerPieza(req, res, next) {
  try {
    const pieza = await piezaService.obtenerPiezaPorId(req.params.id, req.user);
    res.status(200).json(pieza);
  } catch (error) {
    next(error);
  }
}

async function crearPieza(req, res, next) {
  try {
    const datosValidados = createPiezaSchema.parse(req.body);
    const nuevaPieza = await piezaService.crearPieza(datosValidados, req.user);
    res.status(201).json(nuevaPieza);
  } catch (error) {
    next(error);
  }
}

async function actualizarPieza(req, res, next) {
  try {
    const datosValidados = updatePiezaSchema.parse(req.body);
    const piezaActualizada = await piezaService.actualizarPieza(req.params.id, datosValidados, req.user);
    res.status(200).json(piezaActualizada);
  } catch (error) {
    next(error);
  }
}

async function eliminarPieza(req, res, next) {
  try {
    await piezaService.eliminarPieza(req.params.id, req.user);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarPiezas,
  obtenerPieza,
  crearPieza,
  actualizarPieza,
  eliminarPieza,
};
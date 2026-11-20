const { z } = require('zod');
const defectoService = require('../services/defecto.service');

const idParamSchema = z.coerce.number().int().positive('El ID de defecto debe ser un entero positivo.');

const createDefectoSchema = z.object({
  nombre: z.string().min(2, 'El nombre del defecto debe tener al menos 2 caracteres.'),
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres.').optional(),
});

const updateDefectoSchema = createDefectoSchema.partial();

async function listarDefectos(req, res, next) {
  try {
    const defectos = await defectoService.listarDefectos();
    res.status(200).json(defectos);
  } catch (error) {
    next(error);
  }
}

async function obtenerDefecto(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const defecto = await defectoService.obtenerDefectoPorId(id);
    res.status(200).json(defecto);
  } catch (error) {
    next(error);
  }
}

async function crearDefecto(req, res, next) {
  try {
    const datosValidados = createDefectoSchema.parse(req.body);
    const nuevoDefecto = await defectoService.crearDefecto(datosValidados);
    res.status(201).json(nuevoDefecto);
  } catch (error) {
    next(error);
  }
}

async function actualizarDefecto(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const datosValidados = updateDefectoSchema.parse(req.body);
    const defectoActualizado = await defectoService.actualizarDefecto(id, datosValidados);
    res.status(200).json(defectoActualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminarDefecto(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    await defectoService.eliminarDefecto(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarDefectos,
  obtenerDefecto,
  crearDefecto,
  actualizarDefecto,
  eliminarDefecto,
};
const { z } = require('zod');
const registroCalidadService = require('../services/registroCalidad.service');

const idParamSchema = z.coerce.number().int().positive('El ID del registro debe ser un entero positivo.');

const createRegistroCalidadSchema = z.object({
  id_pieza: z.coerce.number().int().positive('El ID de la pieza debe ser un entero positivo.'),
  id_defecto: z.coerce.number().int().positive('El ID del defecto debe ser un entero positivo.'),
  gravedad: z.string().min(2, 'La gravedad debe tener al menos 2 caracteres.'),
  observaciones: z.string().optional(),
});

const updateRegistroCalidadSchema = createRegistroCalidadSchema.partial();

async function listarRegistrosCalidad(req, res, next) {
  try {
    const registros = await registroCalidadService.listarRegistrosCalidad();
    res.status(200).json(registros);
  } catch (error) {
    next(error);
  }
}

async function obtenerRegistroCalidad(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const registro = await registroCalidadService.obtenerRegistroCalidadPorId(id);
    res.status(200).json(registro);
  } catch (error) {
    next(error);
  }
}

async function crearRegistroCalidad(req, res, next) {
  try {
    const datosValidados = createRegistroCalidadSchema.parse(req.body);
    const nuevoRegistro = await registroCalidadService.crearRegistroCalidad(datosValidados);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    next(error);
  }
}

async function actualizarRegistroCalidad(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const datosValidados = updateRegistroCalidadSchema.parse(req.body);
    const registroActualizado = await registroCalidadService.actualizarRegistroCalidad(id, datosValidados);
    res.status(200).json(registroActualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminarRegistroCalidad(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    await registroCalidadService.eliminarRegistroCalidad(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarRegistrosCalidad,
  obtenerRegistroCalidad,
  crearRegistroCalidad,
  actualizarRegistroCalidad,
  eliminarRegistroCalidad,
};
const { z } = require('zod');
const maquinaService = require('../services/maquina.service');

const idParamSchema = z.coerce.number().int().positive('El ID de máquina debe ser un entero positivo.');

const createMaquinaSchema = z.object({
  nombre: z.string().min(2, 'El nombre de la máquina debe tener al menos 2 caracteres.'),
  seccion: z.string().min(2, 'La sección debe tener al menos 2 caracteres.'),
});

const updateMaquinaSchema = createMaquinaSchema.partial();

async function listarMaquinas(req, res, next) {
  try {
    const maquinas = await maquinaService.listarMaquinas();
    res.status(200).json(maquinas);
  } catch (error) {
    next(error);
  }
}

async function obtenerMaquina(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const maquina = await maquinaService.obtenerMaquinaPorId(id);
    res.status(200).json(maquina);
  } catch (error) {
    next(error);
  }
}

async function crearMaquina(req, res, next) {
  try {
    const datosValidados = createMaquinaSchema.parse(req.body);
    const nuevaMaquina = await maquinaService.crearMaquina(datosValidados);
    res.status(201).json(nuevaMaquina);
  } catch (error) {
    next(error);
  }
}

async function actualizarMaquina(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const datosValidados = updateMaquinaSchema.parse(req.body);
    const maquinaActualizada = await maquinaService.actualizarMaquina(id, datosValidados);
    res.status(200).json(maquinaActualizada);
  } catch (error) {
    next(error);
  }
}

async function eliminarMaquina(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    await maquinaService.eliminarMaquina(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarMaquinas,
  obtenerMaquina,
  crearMaquina,
  actualizarMaquina,
  eliminarMaquina,
};
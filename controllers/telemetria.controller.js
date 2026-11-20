const { z } = require('zod');
const telemetriaService = require('../services/telemetria.service');

const createTelemetriaSchema = z.object({
  id_pieza: z.string().nullable().optional(),
  id_maquina: z.number().int().positive('El id_maquina debe ser un entero positivo.'),
  receta_fabricacion: z.string().min(1, 'La receta de fabricación es obligatoria.'),
  temp_vidrio_base: z.number(),
  velocidad_lavadora: z.number().nonnegative(),
  temp_agua_lavadora: z.number(),
  temp_entrada_sala_blanca: z.number(),
  temp_ensamblado: z.number(),
  humedad_ensamblado: z.number().min(0).max(100, 'La humedad debe estar entre 0 y 100.'),
  presion_calandra_1: z.number().nonnegative(),
  presion_calandra_2: z.number().nonnegative(),
  cantidad_polvo_intercalario: z.number().nonnegative(),
  temp_horno: z.number(),
  resistencias_encendidas: z.number().int().nonnegative(),
  temp_salida_horno: z.number(),
});

async function guardarTelemetria(req, res, next) {
  try {
    const datosValidados = createTelemetriaSchema.parse(req.body);
    const nuevoRegistro = await telemetriaService.crearTelemetria(datosValidados);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    next(error); // Va directo al errorHandler RFC 9457
  }
}

async function listarTelemetrias(req, res, next) {
  try {
    const lecturas = await telemetriaService.listarTelemetrias();
    res.status(200).json(lecturas);
  } catch (error) {
    next(error);
  }
}

async function obtenerUltimasLecturas(req, res, next) {
  try {
    const lecturasSuavizadas = await telemetriaService.obtenerUltimasLecturas();
    res.status(200).json(lecturasSuavizadas);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  guardarTelemetria,
  listarTelemetrias,
  obtenerUltimasLecturas,
};
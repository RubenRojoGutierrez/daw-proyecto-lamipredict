const { z } = require('zod');
const usuarioService = require('../services/usuario.service');

const idParamSchema = z.coerce.number().int().positive('El ID de usuario debe ser un entero positivo.');

const createUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('El formato del email no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rol: z.enum(['admin', 'user']).default('user'),
});

const updateUsuarioSchema = createUsuarioSchema.partial();

async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
}

async function obtenerUsuario(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const usuario = await usuarioService.obtenerUsuarioPorId(id);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
}

async function crearUsuario(req, res, next) {
  try {
    const datosValidados = createUsuarioSchema.parse(req.body);
    const nuevoUsuario = await usuarioService.crearUsuario(datosValidados);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
}

async function actualizarUsuario(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    const datosValidados = updateUsuarioSchema.parse(req.body);
    const usuarioActualizado = await usuarioService.actualizarUsuario(id, datosValidados);
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminarUsuario(req, res, next) {
  try {
    const id = idParamSchema.parse(req.params.id);
    await usuarioService.eliminarUsuario(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
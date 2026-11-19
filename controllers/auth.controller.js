const { z } = require('zod');
const authService = require('../services/auth.service');

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Debe ser un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

async function register(req, res, next) {
  try {
    const datosValidados = registerSchema.parse(req.body);
    const nuevoUsuario = await authService.registrarUsuario(datosValidados);
    res.status(201).json(nuevoUsuario); // 201 Created
  } catch (error) {
    next(error); // Delega el error al middleware global RFC 9457
  }
}

async function login(req, res, next) {
  try {
    const datosValidados = loginSchema.parse(req.body);
    const resultado = await authService.loginUsuario(datosValidados);
    res.status(200).json(resultado); // 200 OK
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
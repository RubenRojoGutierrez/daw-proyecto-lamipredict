const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

async function registrarUsuario({ nombre, email, password }) {
  // 1. Hasheamos la contraseña con bcrypt (factor de coste 10)
  const password_hash = await bcrypt.hash(password, 10);

  // 2. Creamos el usuario (si el email ya existe, Prisma lanza P2002 -> errorHandler devuelve 409)
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      password_hash,
      rol: 'user', // Por seguridad, el registro público siempre crea rol estándar
    },
    // select garantiza que password_hash JAMÁS salga de la base de datos hacia la respuesta
    select: {
      id_usuario: true,
      nombre: true,
      email: true,
      rol: true,
    },
  });

  return usuario;
}

async function loginUsuario({ email, password }) {
  // 1. Buscamos al usuario por email
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  // 2. Comprobamos si existe y si la contraseña coincide con el hash
  const passwordValida = usuario
    ? await bcrypt.compare(password, usuario.password_hash)
    : false;

  if (!usuario || !passwordValida) {
    throw new AppError(
      401,
      'Credenciales Inválidas',
      'El correo electrónico o la contraseña son incorrectos.',
      'https://api.lamipredict.es/errors/invalid-credentials'
    );
  }

  // 3. Firmamos el JWT con expiración máxima de 2 horas
  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

module.exports = { registrarUsuario, loginUsuario };
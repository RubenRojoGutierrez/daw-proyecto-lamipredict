const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Campos seguros: NUNCA devolvemos password_hash
const USER_SELECT = {
  id_usuario: true,
  nombre: true,
  email: true,
  rol: true,
};

async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: USER_SELECT,
    orderBy: { id_usuario: 'asc' },
  });
}

async function obtenerUsuarioPorId(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: id },
    select: USER_SELECT,
  });

  if (!usuario) {
    throw new AppError(
      404,
      'Usuario No Encontrado',
      `No existe ningún usuario con el ID ${id}.`,
      'https://api.lamipredict.es/errors/not-found'
    );
  }

  return usuario;
}

async function crearUsuario({ nombre, email, password, rol }) {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.usuario.create({
    data: {
      nombre,
      email,
      password_hash,
      rol,
    },
    select: USER_SELECT,
  });
}

async function actualizarUsuario(id, datos) {
  const dataToUpdate = { ...datos };

  // Si el admin cambia la contraseña, la hasheamos antes de guardar
  if (dataToUpdate.password) {
    dataToUpdate.password_hash = await bcrypt.hash(dataToUpdate.password, SALT_ROUNDS);
    delete dataToUpdate.password;
  }

  return prisma.usuario.update({
    where: { id_usuario: id },
    data: dataToUpdate,
    select: USER_SELECT,
  });
}

async function eliminarUsuario(id) {
  return prisma.usuario.delete({
    where: { id_usuario: id },
    select: USER_SELECT,
  });
}

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
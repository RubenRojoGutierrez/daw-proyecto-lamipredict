const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

async function listarMaquinas() {
  return prisma.maquina.findMany({
    orderBy: { id_maquina: 'asc' },
  });
}

async function obtenerMaquinaPorId(id) {
  const maquina = await prisma.maquina.findUnique({
    where: { id_maquina: id },
  });

  if (!maquina) {
    throw new AppError(
      404,
      'Máquina No Encontrada',
      `No existe ninguna máquina con el ID ${id}.`,
      'https://api.lamipredict.es/errors/not-found'
    );
  }

  return maquina;
}

async function crearMaquina(datos) {
  return prisma.maquina.create({
    data: datos,
  });
}

async function actualizarMaquina(id, datos) {
  return prisma.maquina.update({
    where: { id_maquina: id },
    data: datos,
  });
}

async function eliminarMaquina(id) {
  return prisma.maquina.delete({
    where: { id_maquina: id },
  });
}

module.exports = {
  listarMaquinas,
  obtenerMaquinaPorId,
  crearMaquina,
  actualizarMaquina,
  eliminarMaquina,
};
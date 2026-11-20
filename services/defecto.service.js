const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

async function listarDefectos() {
  return prisma.defecto.findMany({
    orderBy: { id_defecto: 'asc' },
  });
}

async function obtenerDefectoPorId(id) {
  const defecto = await prisma.defecto.findUnique({
    where: { id_defecto: id },
  });

  if (!defecto) {
    throw new AppError(
      404,
      'Defecto No Encontrado',
      `No existe ningún tipo de defecto con el ID ${id}.`,
      'https://api.lamipredict.es/errors/not-found'
    );
  }

  return defecto;
}

async function crearDefecto(datos) {
  return prisma.defecto.create({
    data: datos,
  });
}

async function actualizarDefecto(id, datos) {
  return prisma.defecto.update({
    where: { id_defecto: id },
    data: datos,
  });
}

async function eliminarDefecto(id) {
  return prisma.defecto.delete({
    where: { id_defecto: id },
  });
}

module.exports = {
  listarDefectos,
  obtenerDefectoPorId,
  crearDefecto,
  actualizarDefecto,
  eliminarDefecto,
};
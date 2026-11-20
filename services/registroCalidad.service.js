const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

async function listarRegistrosCalidad() {
  return prisma.registroCalidad.findMany({
    orderBy: { id_registro: 'desc' },
  });
}

async function obtenerRegistroCalidadPorId(id) {
  const registro = await prisma.registroCalidad.findUnique({
    where: { id_registro: id },
  });

  if (!registro) {
    throw new AppError(
      404,
      'Registro de Calidad No Encontrado',
      `No existe ningún registro de calidad con el ID ${id}.`,
      'https://api.lamipredict.es/errors/not-found'
    );
  }

  return registro;
}

async function crearRegistroCalidad(datos) {
  return prisma.registroCalidad.create({
    data: datos,
  });
}

async function actualizarRegistroCalidad(id, datos) {
  return prisma.registroCalidad.update({
    where: { id_registro: id },
    data: datos,
  });
}

async function eliminarRegistroCalidad(id) {
  return prisma.registroCalidad.delete({
    where: { id_registro: id },
  });
}

module.exports = {
  listarRegistrosCalidad,
  obtenerRegistroCalidadPorId,
  crearRegistroCalidad,
  actualizarRegistroCalidad,
  eliminarRegistroCalidad,
};
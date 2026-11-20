const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

// Regla Anti-BOLA: solo el dueño de la pieza o un admin pueden tocarla
function verificarPropiedad(pieza, usuarioActual) {
  if (pieza.id_usuario !== usuarioActual.id_usuario && usuarioActual.rol !== 'admin') {
    throw new AppError(
      403,
      'Acceso Denegado',
      'No tienes permiso para acceder o modificar una pieza que pertenece a otro operario.',
      'https://api.lamipredict.es/errors/forbidden'
    );
  }
}

async function listarPiezas(usuarioActual) {
  // Si es admin ve todas; si es operario (user), Prisma filtra solo las suyas
  const filtro = usuarioActual.rol === 'admin' ? {} : { id_usuario: usuarioActual.id_usuario };

  return prisma.pieza.findMany({
    where: filtro,
    orderBy: { timestamp: 'desc' },
    include: {
      registros_calidad: true, // Trae también sus defectos asociados (relación M:N)
    },
  });
}

async function obtenerPiezaPorId(id_pieza, usuarioActual) {
  const pieza = await prisma.pieza.findUnique({
    where: { id_pieza },
    include: { registros_calidad: true },
  });

  if (!pieza) {
    throw new AppError(
      404,
      'Pieza No Encontrada',
      `No existe ninguna pieza con el código ${id_pieza}.`,
      'https://api.lamipredict.es/errors/not-found'
    );
  }

  verificarPropiedad(pieza, usuarioActual);
  return pieza;
}

async function crearPieza(datos, usuarioActual) {
  return prisma.pieza.create({
    data: {
      ...datos,
      // El propietario SIEMPRE sale del token JWT, nunca del body
      id_usuario: usuarioActual.id_usuario,
    },
  });
}

async function actualizarPieza(id_pieza, datos, usuarioActual) {
  // Reutilizamos obtenerPiezaPorId: ya comprueba que existe (404) y que es suya (403)
  await obtenerPiezaPorId(id_pieza, usuarioActual);

  return prisma.pieza.update({
    where: { id_pieza },
    data: datos,
  });
}

async function eliminarPieza(id_pieza, usuarioActual) {
  await obtenerPiezaPorId(id_pieza, usuarioActual);

  await prisma.pieza.delete({
    where: { id_pieza },
  });
}

module.exports = {
  listarPiezas,
  obtenerPiezaPorId,
  crearPieza,
  actualizarPieza,
  eliminarPieza,
};
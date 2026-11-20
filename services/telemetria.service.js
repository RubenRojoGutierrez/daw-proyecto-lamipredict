const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VENTANA_MEDIA_MOVIL = 3;
const LECTURAS_A_DEVOLVER = 5;

const VARIABLES_SUAVIZADAS = [
  'temp_vidrio_base',
  'temp_agua_lavadora',
  'temp_entrada_sala_blanca',
  'temp_ensamblado',
  'presion_calandra_1',
  'presion_calandra_2',
  'temp_horno',
  'temp_salida_horno',
];

function redondearUnDecimal(valor) {
  return Math.round(valor * 10) / 10;
}

function suavizarLecturas(lecturas) {
  return lecturas.map((lectura, indice) => {
    const ventana = lecturas.slice(indice, indice + VENTANA_MEDIA_MOVIL);
    const suavizada = { ...lectura };

    for (const campo of VARIABLES_SUAVIZADAS) {
      const valores = ventana
        .map((fila) => fila[campo])
        .filter((valor) => typeof valor === 'number' && !Number.isNaN(valor));

      if (valores.length === 0) continue;

      const media = valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
      suavizada[campo] = redondearUnDecimal(media);
    }

    return suavizada;
  });
}

async function crearTelemetria(datosSensor) {
  return prisma.telemetria.create({
    data: datosSensor,
  });
}

async function listarTelemetrias() {
  return prisma.telemetria.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
  });
}

async function obtenerUltimasLecturas() {
  const lecturasCrudas = await prisma.telemetria.findMany({
    orderBy: { timestamp: 'desc' },
    take: LECTURAS_A_DEVOLVER + VENTANA_MEDIA_MOVIL - 1,
  });

  return suavizarLecturas(lecturasCrudas).slice(0, LECTURAS_A_DEVOLVER);
}

module.exports = {
  crearTelemetria,
  listarTelemetrias,
  obtenerUltimasLecturas,
};
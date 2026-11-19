const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding de LamiPredict...');

  // 1. USUARIOS DEMO OBLIGATORIOS (bcrypt coste 10)
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const userHash = await bcrypt.hash('User1234!', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@cifpaviles.es' },
    update: {},
    create: {
      nombre: 'Administrador Planta',
      email: 'admin@cifpaviles.es',
      password_hash: adminHash,
      rol: 'admin',
    },
  });

  const user1 = await prisma.usuario.upsert({
    where: { email: 'user1@cifpaviles.es' },
    update: {},
    create: {
      nombre: 'Operario Turno Mañana',
      email: 'user1@cifpaviles.es',
      password_hash: userHash,
      rol: 'user',
    },
  });

  const user2 = await prisma.usuario.upsert({
    where: { email: 'user2@cifpaviles.es' },
    update: {},
    create: {
      nombre: 'Operario Turno Tarde',
      email: 'user2@cifpaviles.es',
      password_hash: userHash,
      rol: 'user',
    },
  });

  // 2. MÁQUINAS (10 registros)
  const maquinasData = [
    { nombre: 'LAV-01', seccion: 'Lavado' },
    { nombre: 'LAV-02', seccion: 'Lavado' },
    { nombre: 'ENS-01', seccion: 'Sala Blanca' },
    { nombre: 'ENS-02', seccion: 'Sala Blanca' },
    { nombre: 'CAL-01', seccion: 'Calandras' },
    { nombre: 'CAL-02', seccion: 'Calandras' },
    { nombre: 'HOR-01', seccion: 'Horno' },
    { nombre: 'HOR-02', seccion: 'Horno' },
    { nombre: 'AUT-01', seccion: 'Autoclave' },
    { nombre: 'INS-01', seccion: 'Inspección Final' },
  ];

  const maquinas = [];
  for (const m of maquinasData) {
    const maquina = await prisma.maquina.upsert({
      where: { nombre: m.nombre },
      update: {},
      create: m,
    });
    maquinas.push(maquina);
  }

  // 3. DEFECTOS (10 registros)
  const defectosData = [
    { nombre: 'Burbuja PVB', descripcion: 'Aire atrapado entre lámina PVB y vidrio base.' },
    { nombre: 'Delaminación Borde', descripcion: 'Despegue perimetral tras salida de horno.' },
    { nombre: 'Raya Superficial', descripcion: 'Arañazo mecánico en cara externa del vidrio.' },
    { nombre: 'Inclusión Polvo', descripcion: 'Partícula sólida atrapada en sala blanca.' },
    { nombre: 'Desalineación Vidrios', descripcion: 'Desplazamiento superior a 1mm entre hojas.' },
    { nombre: 'Humedad Residual', descripcion: 'Mancha blanquecina por exceso de humedad en ensamblado.' },
    { nombre: 'Sobretensión Térmica', descripcion: 'Deformación óptica por exceso de temperatura en horno.' },
    { nombre: 'Marca Rodillo Calandra', descripcion: 'Huella por presión irregular en rodillos.' },
    { nombre: 'Rotura Esquina', descripcion: 'Astilla o fractura en vértice de la pieza.' },
    { nombre: 'Opacidad Localizada', descripcion: 'Pérdida de transparencia por fallo de adherencia.' },
  ];

  const defectos = [];
  for (const d of defectosData) {
    const defecto = await prisma.defecto.upsert({
      where: { nombre: d.nombre },
      update: {},
      create: d,
    });
    defectos.push(defecto);
  }

  // 4. PIEZAS (10 registros repartidos entre user1 y user2 para probar Anti-BOLA)
  const piezas = [];
  for (let i = 1; i <= 10; i++) {
    const idPieza = `VIDRIO-2026-${String(i).padStart(3, '0')}`;
    const propietario = i <= 5 ? user1.id_usuario : user2.id_usuario;

    const pieza = await prisma.pieza.upsert({
      where: { id_pieza: idPieza },
      update: {},
      create: {
        id_pieza: idPieza,
        id_usuario: propietario,
        programa_fabricacion: 442 + (i % 3),
        numero_carro: 100 + i,
        lote_vidrio_base: `LVB-2611-${String(i).padStart(2, '0')}`,
        lote_pvb: `PVB-076-${String(i).padStart(2, '0')}`,
      },
    });
    piezas.push(pieza);
  }

  // 5. TELEMETRÍAS (10 registros iniciales si la tabla está vacía)
  const totalTelemetrias = await prisma.telemetria.count();
  if (totalTelemetrias === 0) {
    const telemetriasData = piezas.map((pieza, idx) => ({
      id_pieza: pieza.id_pieza,
      id_maquina: maquinas[idx % maquinas.length].id_maquina,
      receta_fabricacion: '44.2_Claro',
      temp_vidrio_base: 22.5 + idx * 0.2,
      velocidad_lavadora: 22.0 + (idx % 3),
      temp_agua_lavadora: 30.0 + (idx % 2),
      temp_entrada_sala_blanca: 24.0,
      temp_ensamblado: 23.8,
      humedad_ensamblado: 24.5 + (idx % 5),
      presion_calandra_1: 5.5,
      presion_calandra_2: 8.4,
      temp_horno: 220.0 + (idx % 4),
      resistencias_encendidas: 12,
      temp_salida_horno: 55.0 + (idx % 3),
      cantidad_polvo_intercalario: 1.2,
    }));

    await prisma.telemetria.createMany({ data: telemetriasData });
  }

  // 6. REGISTROS DE CALIDAD - TABLA M:N (6 registros con atributos propios)
  const totalRegistros = await prisma.registroCalidad.count();
  if (totalRegistros === 0) {
    await prisma.registroCalidad.createMany({
      data: [
        {
          id_pieza: piezas[0].id_pieza,
          id_defecto: defectos[0].id_defecto,
          gravedad: 'CRITICA',
          observaciones: 'Burbuja de 4mm detectada en zona central tras horno.',
        },
        {
          id_pieza: piezas[0].id_pieza,
          id_defecto: defectos[3].id_defecto,
          gravedad: 'BAJA',
          observaciones: 'Partícula menor en borde no visible.',
        },
        {
          id_pieza: piezas[1].id_pieza,
          id_defecto: defectos[1].id_defecto,
          gravedad: 'MEDIA',
          observaciones: 'Leve delaminación en esquina inferior derecha.',
        },
        {
          id_pieza: piezas[2].id_pieza,
          id_defecto: defectos[5].id_defecto,
          gravedad: 'CRITICA',
          observaciones: 'Humedad en sala blanca superó el 30% durante ensamblado.',
        },
        {
          id_pieza: piezas[5].id_pieza,
          id_defecto: defectos[7].id_defecto,
          gravedad: 'MEDIA',
          observaciones: 'Marca leve de rodillo en calandra 1.',
        },
        {
          id_pieza: piezas[7].id_pieza,
          id_defecto: defectos[2].id_defecto,
          gravedad: 'BAJA',
          observaciones: 'Arañazo superficial pulible en inspección final.',
        },
      ],
    });
  }

  console.log('Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const guardarTelemetria = async (req, res) => {
    try {
        // req.body es el paquete JSON completo que nos enviará Python con toda la física
        const datosSensor = req.body; 

        // Insertamos la fila completa en la tabla correspondiente de tu Prisma
        // Nota: Asegúrate de que el nombre 'sensor' coincide con cómo llamaste a 
        // la tabla en schema.prisma (podría ser 'telemetria', 'sensor', 'registro_telemetria'...)
        const nuevoRegistro = await prisma.telemetria.create({
            data: {
                // Claves foráneas (Relaciones con las otras tablas)
                id_pieza: datosSensor.id_pieza,
                id_maquina: datosSensor.id_maquina,
                
                // Parámetros de receta y entrada
                receta_fabricacion: datosSensor.receta_fabricacion,
                temp_vidrio_base: datosSensor.temp_vidrio_base,
                
                // Zona 1: Lavadora
                velocidad_lavadora: datosSensor.velocidad_lavadora,
                temp_agua_lavadora: datosSensor.temp_agua_lavadora,
                
                // Zona 2: Ensamblado / Sala Blanca
                temp_entrada_sala_blanca: datosSensor.temp_entrada_sala_blanca,
                temp_ensamblado: datosSensor.temp_ensamblado,
                humedad_ensamblado: datosSensor.humedad_ensamblado,
                
                // Zona 3: Calandras y PVB
                presion_calandra_1: datosSensor.presion_calandra_1,
                presion_calandra_2: datosSensor.presion_calandra_2,
                cantidad_polvo_intercalario: datosSensor.cantidad_polvo_intercalario,
                
                // Zona 4: Horno
                temp_horno: datosSensor.temp_horno,
                resistencias_encendidas: datosSensor.resistencias_encendidas,
                temp_salida_horno: datosSensor.temp_salida_horno
                
                // Nota: El 'timestamp' no hace falta pedirlo a Python. 
                // Prisma lo genera automáticamente con la hora exacta del servidor 
                // si en tu schema.prisma le pusiste @default(now()) a ese campo.
            }
        });

        res.status(201).json({
            mensaje: 'Telemetría completa guardada con éxito',
            datos: nuevoRegistro
        });

    } catch (error) {
        console.error("Error al registrar telemetría:", error);
        res.status(500).json({ 
            error: 'Fallo interno al registrar los sensores',
            detalle_tecnico: error.message // <-- AÑADIMOS ESTA LÍNEA PARA QUE NOS CHIVE EL ERROR
        });
    }
};

// El ruido térmico y de presión del PLC oscila de muestra a muestra.
// Una ventana de 3 limpia la señal para el dashboard y la IA sin
// retrasar demasiado la respuesta del horno y las calandras.
const VENTANA_MEDIA_MOVIL = 3;
const LECTURAS_A_DEVOLVER = 5;

// Solo temperatura y presión. Velocidad, humedad, polvo y resistencias
// se dejan en crudo: no son el ruido que esta media está pensada para filtrar.
const VARIABLES_SUAVIZADAS = [
    'temp_vidrio_base',
    'temp_agua_lavadora',
    'temp_entrada_sala_blanca',
    'temp_ensamblado',
    'presion_calandra_1',
    'presion_calandra_2',
    'temp_horno',
    'temp_salida_horno'
];

function redondearUnDecimal(valor) {
    return Math.round(valor * 10) / 10;
}

// La serie llega de más reciente a más antigua. Cada fila publicada
// promedia su valor con hasta dos lecturas anteriores. Si la ventana
// no está llena (arranque de línea o pocas muestras), se usa lo que haya.
function suavizarLecturas(lecturas) {
    return lecturas.map((lectura, indice) => {
        const ventana = lecturas.slice(indice, indice + VENTANA_MEDIA_MOVIL);
        const suavizada = { ...lectura };

        for (const campo of VARIABLES_SUAVIZADAS) {
            const valores = ventana
                .map((fila) => fila[campo])
                .filter((valor) => typeof valor === 'number' && !Number.isNaN(valor));

            if (valores.length === 0) {
                continue;
            }

            const media = valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
            suavizada[campo] = redondearUnDecimal(media);
        }

        return suavizada;
    });
}

// Comprobación de línea: las últimas lecturas confirman que el PLC
// está persistiendo telemetría y no solo enviándola al servidor.
// La tabla se lee en crudo; el suavizado solo existe en este JSON.
const obtenerUltimasLecturas = async (req, res) => {
    try {
        const lecturasCrudas = await prisma.telemetria.findMany({
            orderBy: { timestamp: 'desc' },
            // Dos muestras extra para que la más antigua de las 5
            // también tenga ventana de 3, sin devolverlas al cliente.
            take: LECTURAS_A_DEVOLVER + VENTANA_MEDIA_MOVIL - 1
        });

        const lecturasSuavizadas = suavizarLecturas(lecturasCrudas)
            .slice(0, LECTURAS_A_DEVOLVER);

        res.status(200).json(lecturasSuavizadas);
    } catch (error) {
        console.error("Error al consultar las últimas lecturas:", error);
        res.status(500).json({
            error: 'Fallo interno al consultar las últimas lecturas',
            detalle_tecnico: error.message
        });
    }
};

module.exports = {
    guardarTelemetria,
    obtenerUltimasLecturas
};
// ==========================================
// SIMULADOR PLC - LAMIPREDICT (GEMELO DIGITAL)
// ==========================================

// ==========================================
// 1. CONFIGURACIÓN Y ESTADO DE LA LÍNEA
// ==========================================
const API_TELEMETRIA = 'http://localhost:3000/api/telemetria';
const API_PIEZAS = 'http://localhost:3000/api/piezas';
const INTERVALO_PLC = 1000; // Bajamos a 1 segundo para capturar bien el paso rápido

// Estado dinámico
let pasandoVidrio = false; 
let id_pieza_actual = null; 
let contador_piezas = 1;    
let tiempo_inicio_pieza = 0;   

// Variables Maestras de Producción
let id_maquina_activa = 2; // Asegúrate de que esta máquina existe en tu BD
let velocidad_cinta_base = 12.0; 
let receta_actual = "44.2_Claro"; 
let cantidad_polvo_fijo = 3.0;
let resistencias_base = 20; 

// ==========================================
// 2. RANGOS Y COMPORTAMIENTO DE LOS SENSORES
// ==========================================
const perfilesSensores = {
    temp_vidrio_base: { enVacio: 18.0, idealConVidrio: 18.0, ruidoTermico: 0.2 }, 
    velocidad_lavadora: { enVacio: 0.0, idealConVidrio: 22.0, ruidoTermico: 0.1 },
    temp_agua_lavadora: { enVacio: 25.0, idealConVidrio: 30.0, ruidoTermico: 0.1 },
    temp_entrada_sala_blanca: { enVacio: 20.0, idealConVidrio: 24.0, ruidoTermico: 0.1 },
    temp_ensamblado: { enVacio: 16.0, idealConVidrio: 16.0, ruidoTermico: 0.1 },
    humedad_ensamblado: { enVacio: 26.0, idealConVidrio: 26.0, ruidoTermico: 0.2 },
    presion_calandra_1: { enVacio: 0.0, idealConVidrio: 9.7, ruidoTermico: 0.1 },
    presion_calandra_2: { enVacio: 0.0, idealConVidrio: 21.7, ruidoTermico: 0.1 },
    temp_horno: { enVacio: 150.0, idealConVidrio: 220.0, ruidoTermico: 0.15 }, 
    temp_salida_horno: { enVacio: 40.0, idealConVidrio: 55.0, ruidoTermico: 0.1 }
};

// ==========================================
// 3. FUNCIONES MATEMÁTICAS (RUIDO Y FÍSICA)
// ==========================================

// Imita la señal eléctrica imperfecta de un sensor
function leerSensorConRuido(valorBase, variacionMaxima) {
    const ruido = (Math.random() * 2 - 1) * variacionMaxima;
    const lecturaBruta = valorBase + ruido;
    return parseFloat(lecturaBruta.toFixed(1));
}

// Calcula la temperatura en función de la velocidad de la línea
function calcularTempSalida(velocidadActual) {
    const VEL_REFERENCIA = 12.0; 
    const TEMP_REFERENCIA = perfilesSensores.temp_salida_horno.idealConVidrio; 
    
    let tempBaseAjustada = (VEL_REFERENCIA / velocidadActual) * TEMP_REFERENCIA;
    return leerSensorConRuido(tempBaseAjustada, perfilesSensores.temp_salida_horno.ruidoTermico);
}

// ==========================================
// 4. BUCLE DE INYECCIÓN (EL CORAZÓN DEL PLC)
// ==========================================
async function enviarDatosPLC() {
    let lecturas = {};
    let segundosEnLinea = 0;

    // Calculamos por dónde va el vidrio
    if (pasandoVidrio) {
        segundosEnLinea = (Date.now() - tiempo_inicio_pieza) / 1000;
        
        // Si ya pasaron los 10 segundos, el vidrio salió de la línea.
        if (segundosEnLinea > 10) {
            console.log(`[PLC] 🏁 Pieza ${id_pieza_actual} finalizó su recorrido.`);
            pasandoVidrio = false;
            id_pieza_actual = null;
        }
    }

    if (pasandoVidrio) {
        // --- SENSORES DE ESTADO DE MÁQUINA (Siempre activos si hay producción) ---
        lecturas.temp_vidrio_base = leerSensorConRuido(perfilesSensores.temp_vidrio_base.idealConVidrio, perfilesSensores.temp_vidrio_base.ruidoTermico);
        lecturas.velocidad_lavadora = leerSensorConRuido(perfilesSensores.velocidad_lavadora.idealConVidrio, perfilesSensores.velocidad_lavadora.ruidoTermico);
        lecturas.temp_agua_lavadora = leerSensorConRuido(perfilesSensores.temp_agua_lavadora.idealConVidrio, perfilesSensores.temp_agua_lavadora.ruidoTermico);
        lecturas.temp_ensamblado = leerSensorConRuido(perfilesSensores.temp_ensamblado.idealConVidrio, perfilesSensores.temp_ensamblado.ruidoTermico);
        lecturas.humedad_ensamblado = leerSensorConRuido(perfilesSensores.humedad_ensamblado.idealConVidrio, perfilesSensores.humedad_ensamblado.ruidoTermico);
        lecturas.temp_horno = leerSensorConRuido(perfilesSensores.temp_horno.idealConVidrio, perfilesSensores.temp_horno.ruidoTermico);
        lecturas.resistencias_encendidas = Math.round(resistencias_base + (Math.random() * 2 - 1)); 

        // --- SENSORES DE POSICIÓN (Ventanas de tiempo de 10 segundos) ---
        
        // 1. Termómetro de entrada a sala blanca (Lee el vidrio entre el seg 2 y el 4)
        if (segundosEnLinea >= 2 && segundosEnLinea <= 4) {
            lecturas.temp_entrada_sala_blanca = leerSensorConRuido(perfilesSensores.temp_entrada_sala_blanca.idealConVidrio, perfilesSensores.temp_entrada_sala_blanca.ruidoTermico);
        } else {
            lecturas.temp_entrada_sala_blanca = leerSensorConRuido(perfilesSensores.temp_entrada_sala_blanca.enVacio, perfilesSensores.temp_entrada_sala_blanca.ruidoTermico);
        }

        // 2. Calandra 1 (Pinza el vidrio entre el seg 5 y el 7)
        if (segundosEnLinea >= 5 && segundosEnLinea <= 7) {
            lecturas.presion_calandra_1 = leerSensorConRuido(perfilesSensores.presion_calandra_1.idealConVidrio, perfilesSensores.presion_calandra_1.ruidoTermico);
        } else {
            lecturas.presion_calandra_1 = perfilesSensores.presion_calandra_1.enVacio;
        }

        // 3. Calandra 2 (Pinza el vidrio entre el seg 6 y el 8)
        if (segundosEnLinea >= 6 && segundosEnLinea <= 8) {
            lecturas.presion_calandra_2 = leerSensorConRuido(perfilesSensores.presion_calandra_2.idealConVidrio, perfilesSensores.presion_calandra_2.ruidoTermico);
        } else {
            lecturas.presion_calandra_2 = perfilesSensores.presion_calandra_2.enVacio;
        }

        // 4. Pirómetro salida horno (Lee el vidrio asomando entre el seg 8 y el 10)
        if (segundosEnLinea >= 8 && segundosEnLinea <= 10) {
            lecturas.temp_salida_horno = calcularTempSalida(velocidad_cinta_base); 
        } else {
            lecturas.temp_salida_horno = leerSensorConRuido(perfilesSensores.temp_salida_horno.enVacio, 1.0);
        }

    } else {
        // --- MODO VACÍO (Línea sin vidrio) ---
        lecturas.temp_vidrio_base = leerSensorConRuido(perfilesSensores.temp_vidrio_base.enVacio, perfilesSensores.temp_vidrio_base.ruidoTermico);
        lecturas.velocidad_lavadora = perfilesSensores.velocidad_lavadora.enVacio;
        lecturas.temp_agua_lavadora = leerSensorConRuido(perfilesSensores.temp_agua_lavadora.enVacio, perfilesSensores.temp_agua_lavadora.ruidoTermico);
        lecturas.temp_entrada_sala_blanca = leerSensorConRuido(perfilesSensores.temp_entrada_sala_blanca.enVacio, perfilesSensores.temp_entrada_sala_blanca.ruidoTermico);
        lecturas.temp_ensamblado = leerSensorConRuido(perfilesSensores.temp_ensamblado.enVacio, perfilesSensores.temp_ensamblado.ruidoTermico);
        lecturas.humedad_ensamblado = leerSensorConRuido(perfilesSensores.humedad_ensamblado.enVacio, perfilesSensores.humedad_ensamblado.ruidoTermico);
        lecturas.presion_calandra_1 = perfilesSensores.presion_calandra_1.enVacio;
        lecturas.presion_calandra_2 = perfilesSensores.presion_calandra_2.enVacio;
        lecturas.temp_horno = leerSensorConRuido(perfilesSensores.temp_horno.enVacio, 1.0);
        lecturas.temp_salida_horno = leerSensorConRuido(perfilesSensores.temp_salida_horno.enVacio, 1.0);
        lecturas.resistencias_encendidas = 5; 
    }

    // (El resto del payload y el fetch() se quedan exactamente igual que los tenías)
    const payload = {
        id_maquina: id_maquina_activa, 
        id_pieza: id_pieza_actual, 
        receta_fabricacion: receta_actual,
        temp_vidrio_base: lecturas.temp_vidrio_base,
        velocidad_lavadora: lecturas.velocidad_lavadora,
        temp_agua_lavadora: lecturas.temp_agua_lavadora,
        temp_entrada_sala_blanca: lecturas.temp_entrada_sala_blanca,
        temp_ensamblado: lecturas.temp_ensamblado,
        humedad_ensamblado: lecturas.humedad_ensamblado,
        presion_calandra_1: lecturas.presion_calandra_1,
        presion_calandra_2: lecturas.presion_calandra_2,
        temp_horno: lecturas.temp_horno,
        resistencias_encendidas: lecturas.resistencias_encendidas, 
        temp_salida_horno: lecturas.temp_salida_horno,
        cantidad_polvo_intercalario: cantidad_polvo_fijo
    };

    try {
        const respuesta = await fetch(API_TELEMETRIA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (respuesta.ok) {
            // Imprimimos la posición en segundos para verlo claro en la consola
            let estado = pasandoVidrio ? `T+${Math.floor(segundosEnLinea)}s` : 'VACÍO';
            console.log(`[PLC] Datos OK -> [${estado}] Pieza: ${id_pieza_actual || '-'} | S.Blanca: ${lecturas.temp_entrada_sala_blanca}ºC | Horno Salida: ${lecturas.temp_salida_horno}ºC`);
        } else {
            console.error(`[PLC] Error servidor BD. Código: ${respuesta.status}`);
        }
    } catch (error) {
        console.error("[PLC] Error de conexión:", error.message);
    }
}

// ==========================================
// 5. GENERADOR DE PRODUCCIÓN (EL ERP)
// ==========================================
async function generarNuevaPieza() {
    // Generamos un código corto aleatorio o basado en la hora para esta sesión (ej: 4892)
    const loteSesion = Math.floor(Date.now() / 1000).toString().slice(-4);
    
    // Ahora las piezas se llamarán algo como: PROD-4892-001, PROD-4892-002...
    const nuevoId = `PROD-${loteSesion}-${contador_piezas.toString().padStart(3, '0')}`;
    
    console.log(`\n=========================================`);
    console.log(`[ERP] 🏭 Orden de fabricación: ${nuevoId}`);
    
    try {
        const respuestaPieza = await fetch(API_PIEZAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_pieza: nuevoId,
                // AÑADIMOS LOS CAMPOS OBLIGATORIOS DE TU SCHEMA:
                id_usuario: 1, // ⚠️ IMPORTANTE: Asegúrate de que el usuario con ID 1 existe en tu tabla Usuario
                programa_fabricacion: 1045, // Un número de programa ficticio
                numero_carro: 12, // El carro donde va apoyado el vidrio
                lote_vidrio_base: "LOTE-V-8890", 
                lote_pvb: "PVB-EASTMAN-004"
            })
        });

        if (respuestaPieza.ok) {
            console.log(`[ERP] Pieza ${nuevoId} registrada en base de datos.`);
            id_pieza_actual = nuevoId;
            pasandoVidrio = true;
            tiempo_inicio_pieza = Date.now(); // NUEVO: Disparamos el cronómetro en milisegundos
            contador_piezas++; 
        } else {
            console.error(`[ERP] ❌ Error al registrar pieza. Código: ${respuestaPieza.status}`);
            pasandoVidrio = false;
            id_pieza_actual = null;
        }
    } catch (error) {
        console.error("[ERP] Error de red al crear pieza:", error.message);
    }
}
// ==========================================
// 6. ARRANQUE DEL SISTEMA
// ==========================================
console.log("🔌 Iniciando Gemelo Digital PLC - LamiPredict...");
console.log("Esperando inicio de producción...\n");

// 1. El PLC lee sensores y envía datos cada 2 segundos
setInterval(enviarDatosPLC, INTERVALO_PLC);

// 2. El ERP mete un cristal nuevo cada 15 segundos (luego súbelo a 60000 para que sea 1 minuto real)
setInterval(generarNuevaPieza, 15000); 

// 3. Forzamos la entrada de la primera pieza al arrancar
setTimeout(generarNuevaPieza, 2000);
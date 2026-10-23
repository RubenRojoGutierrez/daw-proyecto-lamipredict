# Anteproyecto: LamiPredict - Dashboard Industrial para Línea de Laminación

**Módulo:** Proyecto Intermodular (0379 · PIDW2) — 2º DAW Virtual  
**Centro:** CIFP Avilés (Curso 2026/2027)  
**Autor/a:** Rubén Rojo Gutiérrez  
**Repositorio GitHub:** https://github.com/RubenRojoGutierrez/daw-proyecto-lamipredict
**Tablero GitHub Projects:** https://github.com/users/RubenRojoGutierrez/projects/2/views/1
---

## 1. Justificación y dominio funcional

### 1.1. Elevator pitch
LamiPredict es un dashboard web industrial diseñado para unificar la trazabilidad en líneas de producción de vidrio laminado. Actualmente, los datos operativos de las máquinas (lavadora, horno, autoclave) y los registros humanos de control de calidad funcionan en sistemas aislados, dificultando el análisis de fallos. Esta aplicación resuelve el problema integrando la telemetría generada por un simulador de software propio con los reportes manuales de defectos en una única plataforma centralizada. El valor que aporta es doble: optimiza el control de calidad diario al ofrecer visibilidad en tiempo real y, sobre todo, genera un registro de datos consolidado y estructurado, indispensable para poder entrenar futuros modelos de Inteligencia Artificial orientados al mantenimiento y calidad predictiva.

### 1.2. Público objetivo y contexto de uso
Va dirigida al personal de planta industrial. Los **Operadores de línea** la utilizarán a pie de máquina mediante tablets o terminales para confirmar el ensamblado de volúmenes y registrar defectos visuales. Los **Jefes de línea o Supervisores** la usarán en las salas de control para monitorizar la telemetría y analizar el histórico de producción y calidad.

### 1.3. Desacoplamiento OT y Simulación de Telemetría
Para garantizar la total reproducibilidad del proyecto en cualquier entorno de evaluación y eliminar la dependencia de licencias privativas de tecnología de operaciones (como Rockwell Automation), el sistema prescinde de una conexión directa a un PLC físico. En su lugar, el alcance incluye el desarrollo de un simulador por software propio mediante un script automatizado (Node.js o Python). Este script actuará como un "falso PLC", inyectando telemetría sintética de forma continua mediante peticiones HTTP al endpoint dedicado `POST /api/telemetria`, replicando fielmente el comportamiento de la línea de laminado.

---

## 2. Roles del sistema y casos de uso

### 2.1. Roles del Sistema (RBAC)
* **Administrador:** Perfil de RRHH o Jefe de Planta con privilegios exclusivos para dar de alta a nuevos trabajadores y auditar la trazabilidad global.
* **Operario:** Perfil de planta autorizado únicamente para confirmar nuevos volúmenes de vidrio e incidencias de calidad en su estación.
* **Invitado:** Perfil de solo lectura (Auditor) que no puede modificar datos.

### 2.2. Flujos de los Casos de Uso (CU)
1. **CU-00: Gestión y Alta de Usuarios:** 
   * *Actor:* Administrador. 
   * *Flujo:* 1. El Admin accede al panel. 2. Selecciona "Nuevo Operario". 3. Introduce nombre, email y asigna el rol. 4. El sistema cifra la contraseña (hash) y habilita al usuario.
2. **CU-01: Autenticación en el sistema (Login):** 
   * *Actor:* Administrador / Operario / Invitado. 
   * *Flujo:* 1. El trabajador introduce email y contraseña. 2. El sistema valida el hash. 3. Devuelve un token JWT y permite el acceso a las pantallas según el rol.
3. **CU-02: Confirmación de Ensamblado (Registro de Pieza):** 
   * *Actor:* Operario. 
   * *Flujo:* 1. La maquinaria de la línea realiza la unión física del vidrio base y el PVB en la zona de ensamblado. 2. El operario confirma la acción en el terminal y registra el lote de vidrio consumido junto con el PVB cargado. 3. El sistema genera el id_pieza único y marca el inicio del seguimiento.
4. **CU-03: Ingesta Automática de Telemetría:** 
   * *Actor:* Sistema (Script Simulador). 
   * *Flujo:* 1. El script genera un JSON con métricas físicas aleatorias dentro de rangos lógicos. 2. Realiza un `POST /api/telemetria` incluyendo `id_pieza` e `id_maquina`. 3. El servidor valida y guarda la biografía térmica/mecánica de ese volumen.
5. **CU-04: Registro de Defecto de Calidad:** 
   * *Actor:* Operario. 
   * *Flujo:* 1. Detecta una anomalía visual. 2. Selecciona el tipo de defecto en la app e indica la gravedad. 3. El sistema vincula el defecto al `id_pieza` activo.
6. **CU-05: Consulta de Trazabilidad Unitaria:** 
   * *Actor:* Administrador / Invitado. 
   * *Flujo:* 1. Introduce un `id_pieza` en el buscador. 2. El sistema cruza tablas y extrae la información. 3. Muestra lotes usados, gráfica de telemetría y resultados de calidad.

### 2.3. Alcance del MVP (Hito 3, diciembre)
- **Incluido:** Sistema de autenticación JWT, operaciones CRUD de piezas y defectos, captura de telemetría desde el simulador de software propio, e interfaz funcional (dashboard) para operadores y supervisores.
- **Fuera del MVP:** Entrenamiento e integración del modelo de Inteligencia Artificial predictivo y generación automatizada de informes exportables avanzados.

---

## 3. Modelo de datos

- **Diagrama Entidad-Relación en 3FN:** [docs/der.md](docs/der.md)
- **Entidades de negocio principales:** `PIEZA`, `MAQUINA`, `TELEMETRIA`, `DEFECTO`, `REGISTRO_CALIDAD`, `USUARIO`.
- **Relaciones principales:** 1:N (Máquina → Telemetría; Pieza → Telemetría). M:N (Pieza ↔ Defecto mediante tabla intermedia `REGISTRO_CALIDAD`).

### 3.1. Justificación de Trazabilidad Unitaria y Asociación Telemétrica
En LamiPredict, la trazabilidad no se realiza por un "lote" genérico, sino de forma unitaria por volumen físico (`PIEZA`). Al confirmar el ensamblado del vidrio base y el PVB en la sala blanca, el sistema genera un `id_pieza` único y lo asocia a los lotes de las materias primas consumidas. A partir de ese momento, cada vez que el script de simulación envía datos al endpoint de telemetría, el *payload* JSON incluye obligatoriamente el `id_pieza` y el `id_maquina`. De esta forma, la base de datos asocia inequívocamente cada variable física a la máquina que la generó y al volumen exacto de vidrio.

---

## 4. Stack tecnológico previsto

- **Motor de base de datos:** PostgreSQL — Ideal para relacionar catálogos estructurados y manejar eficientemente series temporales de datos (telemetría IoT).
- **Backend API:** Node.js (Express) — Por su naturaleza asíncrona orientada a eventos, excelente para gestionar el flujo constante de datos del simulador.
- **Simulador PLC (OT):** Script automatizado independiente (Node.js o Python) programado para generar perfiles físicos realistas (temperaturas, presiones) y emitir peticiones HTTP temporizadas.
- **Frontend:** Vue.js — Curva de aprendizaje ágil, reactividad bidireccional perfecta para la actualización de dashboards en tiempo real, e integración nativa con el currículo del ciclo.
- **Alojamiento cloud previsto:** Render — Facilidad de despliegue automatizado, soporte nativo para contenedores y bases de datos PostgreSQL gestionadas en capa gratuita/estudiantil.

---

## 5. Selección tentativa de Add-ons (mínimo 2)

- [ ] Dockerización multicontenedor con Docker Compose (+1.0)
- [x] Pipeline CI/CD automatizado con GitHub Actions (+1.0)
- [ ] Almacenamiento desacoplado en AWS S3 / Cloudinary (+0.5)
- [ ] Pasarela de pagos Stripe en entorno Sandbox con Webhooks (+1.0)
- [ ] Generación de informes en PDF/Excel en backend (+0.5)
- [x] WebSockets / Comunicación en tiempo real (+1.0)
- [ ] Batería de pruebas automatizadas (>40 % de endpoints) (+1.0)
- [x] Documentación OpenAPI / Swagger interactiva (+0.5)


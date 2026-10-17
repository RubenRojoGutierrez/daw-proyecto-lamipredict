# Anteproyecto: LamiPredict - Dashboard Industrial para Línea de Laminación

**Módulo:** Proyecto Intermodular (0379 · PIDW2) — 2º DAW Virtual  
**Centro:** CIFP Avilés (Curso 2026/2027)  
**Autor/a:** Rubén Rojo Gutiérrez  
**Repositorio GitHub:** https://github.com/RubenRojoGutierrez/daw-proyecto-lamipredict 
**Tablero GitHub Projects:** https://github.com/users/RubenRojoGutierrez/projects/2/views/1
---

## 1. Justificación y dominio funcional

### 1.1. Elevator pitch (100–150 palabras)
LamiPredict es un dashboard web industrial diseñado para unificar la trazabilidad en líneas de producción de vidrio laminado. Actualmente, los datos operativos de las máquinas (lavadora, horno, autoclave) y los registros humanos de control de calidad funcionan en sistemas aislados, dificultando el análisis de fallos. Esta aplicación resuelve el problema integrando la telemetría generada por una máquina virtual de Rockwell Automation (Studio 5000) con los reportes manuales de defectos en una única plataforma centralizada. El valor que aporta es doble: optimiza el control de calidad diario al ofrecer visibilidad en tiempo real y, sobre todo, genera un registro de datos consolidado y estructurado, indispensable para poder entrenar futuros modelos de Inteligencia Artificial orientados al mantenimiento y calidad predictiva.

### 1.2. Público objetivo y contexto de uso
Va dirigida al personal de planta industrial. Los **Operadores de línea** la utilizarán a pie de máquina mediante tablets o terminales para registrar defectos visuales en los lotes de vidrio. Los **Jefes de línea o Supervisores** la usarán en las salas de control para monitorizar la telemetría de los PLCs y analizar el histórico de producción y calidad.

---

## 2. Roles del sistema y casos de uso

### 2.1. Matriz de roles (RBAC)
- **Administrador (Jefe de Línea):** Acceso total. Puede gestionar el catálogo de defectos, administrar usuarios, visualizar dashboards de telemetría completa y auditar el historial de producción.
- **Usuario registrado (Operador):** Operativa principal de planta. Puede registrar nuevos lotes de vidrio y asignarles defectos visuales tras la inspección.
- **Público / invitado:** Solo puede ver la pantalla de inicio de sesión. No hay acceso a datos industriales sin autenticación.

### 2.2. Casos de uso principales (mínimo 6)
1. **CU-01:** Registro e inicio de sesión seguro con tokens JWT.
2. **CU-02:** Gestión y mantenimiento del catálogo de defectos de calidad (Admin).
3. **CU-03:** Visualización del dashboard de telemetría (temperaturas, presiones de lavadora, horno y autoclave) (Admin/Operador).
4. **CU-04:** Registro en el sistema de un nuevo lote o volumen de vidrio procesado (Operador).
5. **CU-05:** Asignación de defectos visuales a un lote de vidrio específico tras inspección manual (Operador).
6. **CU-06:** Consulta y filtrado del histórico de trazabilidad cruzando lotes y parámetros de máquina (Admin).

### 2.3. Alcance del MVP (Hito 3, diciembre)
- **Incluido:** Sistema de autenticación JWT, operaciones CRUD de lotes y defectos, captura de telemetría básica desde el entorno emulado de Rockwell Automation, e interfaz funcional (dashboard) para operadores y supervisores.
- **Fuera del MVP:** Entrenamiento e integración del modelo de Inteligencia Artificial predictivo y generación automatizada de informes exportables avanzados.

---

## 3. Modelo de datos
- **Diagrama Entidad-Relación en 3FN:** [docs/der.md](docs/der.md)
- **Relación 1:N:** Lotes → Telemetría (Un lote de vidrio tiene asociadas múltiples lecturas temporales de los sensores de la máquina).
- **Relación M:N con atributos:** Lotes ↔ Defectos mediante `registro_calidad(id_lote, id_defecto, fecha_registro, gravedad, observaciones)`.

---

## 4. Stack tecnológico previsto
- **Motor de base de datos:** PostgreSQL — Ideal para relacionar catálogos estructurados y manejar eficientemente series temporales de datos (telemetría IoT).
- **Backend API:** Node.js (Express) — Por su naturaleza asíncrona orientada a eventos, excelente para gestionar el flujo constante de datos procedentes de los PLCs.
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

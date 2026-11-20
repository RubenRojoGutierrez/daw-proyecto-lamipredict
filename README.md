# LamiPredict — Backend Industrial y Telemetría (Hito 2)

**LamiPredict** es una aplicación web orientada a la monitorización en tiempo real, trazabilidad de piezas y control de calidad en una línea industrial de fabricación de vidrio plano laminado.

Este repositorio contiene la API REST del **Hito 2**, diseñada bajo una arquitectura de 4 capas con autenticación JWT, control de acceso basado en roles (RBAC), validación estricta de esquemas y manejo estandarizado de errores.

---

## Stack Tecnológico

* **Entorno y Framework:** Node.js + Express
* **Base de Datos y ORM:** PostgreSQL + Prisma ORM
* **Validación de Datos:** Zod (v4)
* **Seguridad:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
* **Estándar de Errores:** RFC 9457 (Problem Details for HTTP APIs)

---

## Arquitectura del Proyecto (4 Capas)

El backend separa responsabilidades de forma estricta para facilitar el mantenimiento y la escalabilidad:

1. **Rutas (`routes/`):** Definen los endpoints y aplican los middlewares de seguridad (`authGuard`, `roleGuard`).
2. **Controladores (`controllers/`):** Validan parámetros y cuerpos de petición con **Zod** y gestionan los códigos de estado HTTP.
3. **Servicios (`services/`):** Contienen la lógica de negocio, reglas de autorización a nivel de recurso (Anti-BOLA) y llamadas a la base de datos.
4. **Persistencia (`prisma/`):** Esquema relacional en PostgreSQL gestionado mediante Prisma Client.
5. **Middlewares (`middlewares/`):**
   * `authGuard.js`: Verifica la firma y vigencia del token JWT en la cabecera `Authorization: Bearer <token>`.
   * `roleGuard.js`: Restringe el acceso según el rol del usuario autenticado (`admin` / `user`).
   * `errorHandler.js`: Captura errores de aplicación (`AppError`), validación (`ZodError`) y Prisma, devolviendo siempre respuestas homogéneas en formato **RFC 9457**.

---

## Seguridad y Matriz RBAC

* **Hashing de contraseñas:** Todas las contraseñas se almacenan con `bcryptjs`. Ningún endpoint devuelve el campo `password_hash`.
* **Roles:** `admin` (Administrador de Planta) y `user` (Operario de Línea).

| Módulo / Endpoint | `GET` | `POST` | `PUT` | `DELETE` | Notas de Seguridad |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `/api/auth/login` y `/register` | — | Público | — | — | Emite JWT firmado |
| `/api/usuarios` | `admin` | `admin` | `admin` | `admin` | Sin exposición de `password_hash` |
| `/api/maquinas` | `user` / `admin` | `admin` | `admin` | `admin` | Catálogo de maquinaria de línea |
| `/api/defectos` | `user` / `admin` | `admin` | `admin` | `admin` | Catálogo tipificado de defectos |
| `/api/calidad` | `user` / `admin` | `user` / `admin` | `admin` | `admin` | Operarios registran; solo `admin` edita/borra histórico |
| `/api/piezas` | `user` / `admin` | `user` / `admin` | `user` / `admin` | `admin` | Protección Anti-BOLA en recursos propios |
| `/api/telemetria` | `user` / `admin` | Autenticado (JWT) | — | — | Escritura blindada para el simulador PLC |

---

## Gemelo Digital (`simulador_plc.js`)

En una planta real, la telemetría procedería de un autómata programable industrial (PLC). Para el entorno de desarrollo y validación de este proyecto, el script **`simulador_plc.js`** actúa como un **gemelo digital** que emula el comportamiento de los sensores de línea:

1. Se autentica automáticamente contra `/api/auth/login` para obtener un token JWT válido.
2. Envía lecturas periódicas de telemetría a `POST /api/telemetria` incluyendo el token en la cabecera `Authorization`.

---

## Instalación y Puesta en Marcha

### 1. Requisitos previos
* Node.js (v18 o superior)
* PostgreSQL en ejecución

### 2. Clonar e instalar dependencias
```bash
git clone [https://github.com/tu-usuario/daw-proyecto-lamipredict.git](https://github.com/tu-usuario/daw-proyecto-lamipredict.git)
cd daw-proyecto-lamipredict
npm install
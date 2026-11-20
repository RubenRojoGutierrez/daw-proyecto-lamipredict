class AppError extends Error {
  constructor(status, title, detail, type = 'about:blank', errors = undefined) {
    super(detail);
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type;
    this.errors = errors;
  }
}

function errorHandler(err, req, res, next) {
  console.error('🔥 [ERROR SERVIDOR]:', err); // <-- Aquí dentro es su sitio

  let status = err.status || 500;
  let title = err.title || 'Error Interno del Servidor';
  let detail = err.detail || 'Ha ocurrido un error inesperado en el servidor.';
  let type = err.type || 'https://api.lamipredict.es/errors/internal-error';
  let errors = err.errors;

 // Error de validación Zod -> 422 Unprocessable Entity
 if (err.name === 'ZodError') {
  status = 422;
  title = 'Error de Validación de Parámetros';
  detail = 'Uno o más campos no cumplen las reglas de validación.';
  type = 'https://api.lamipredict.es/errors/validation-failed';
  const listaErrores = err.issues || err.errors || [];
  errors = listaErrores.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    status = 409;
    title = 'Conflicto de Unicidad';
    detail = 'Ya existe un registro con ese valor único.';
    type = 'https://api.lamipredict.es/errors/conflict';
  } else if (err.code === 'P2025') {
    status = 404;
    title = 'Recurso No Encontrado';
    detail = 'El recurso solicitado no existe.';
    type = 'https://api.lamipredict.es/errors/not-found';
  }

  // JSON malformado en el body -> 400 Bad Request
  if (err.type === 'entity.parse.failed') {
    status = 400;
    title = 'Petición Malformada';
    detail = 'El cuerpo JSON de la petición no es válido.';
    type = 'https://api.lamipredict.es/errors/bad-request';
  }

  const problem = {
    type,
    title,
    status,
    detail,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    problem.errors = errors;
  }

  res.status(status).json(problem);
}

module.exports = { AppError, errorHandler };
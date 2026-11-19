const { AppError } = require('./errorHandler');

function roleGuard(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return next(
        new AppError(
          403,
          'Acceso Denegado',
          'No tienes permisos suficientes para realizar esta acción.',
          'https://api.lamipredict.es/errors/forbidden'
        )
      );
    }
    next();
  };
}

module.exports = roleGuard;
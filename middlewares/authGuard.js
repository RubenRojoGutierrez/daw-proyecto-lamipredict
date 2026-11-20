const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        401,
        'No Autenticado',
        'Falta el token de autenticación en la cabecera Authorization.',
        'https://api.lamipredict.es/errors/unauthorized'
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id_usuario, email, rol }
    next();
  } catch (error) {
    return next(
      new AppError(
        401,
        'Token Inválido o Expirado',
        'El token JWT proporcionado no es válido o ha caducado.',
        'https://api.lamipredict.es/errors/invalid-token'
      )
    );
  }
}

module.exports = authGuard;
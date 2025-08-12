// middlewares/auth.js
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

// Middleware para verificar JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    const decoded = verifyToken(token);

    // Verificar que el usuario aún existe
    const user = await User.findByPk(decoded.id); // findByPk en lugar de findById
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Usuario no válido",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token inválido",
    });
  }
};

// Middleware opcional (no requiere autenticación pero la verifica si existe)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);

      if (user && user.isActive) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Continuar sin autenticación si el token es inválido
    next();
  }
};

// Middleware para verificar si el usuario está autenticado via sesión
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: "Acceso denegado. Inicia sesión.",
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAuth,
};

// middlewares/cookieAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieAuth = async (req, res, next) => {
  try {
    console.log("🍪 Validando cookie de autenticación...");
    console.log("🍪 Cookies disponibles:", Object.keys(req.cookies || {}));

    // Obtener token de la cookie
    const token = req.cookies?.authToken;

    if (!token) {
      console.log("❌ No hay token en cookie");
      return res.status(401).json({
        success: false,
        message: "Token de autenticación requerido",
      });
    }

    console.log("🔑 Token encontrado en cookie");

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token válido para usuario:", decoded.id);

    // Buscar usuario en BD
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      console.log("❌ Usuario no encontrado o inactivo");
      return res.status(401).json({
        success: false,
        message: "Usuario no válido",
      });
    }

    // Agregar usuario al request
    req.user = user;
    console.log("✅ Usuario autenticado:", user.email);

    next();
  } catch (error) {
    console.error("❌ Error validando cookie:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// Middleware opcional (no falla si no hay token)
const optionalCookieAuth = async (req, res, next) => {
  try {
    console.log("🍪 Verificación opcional de cookie...");
    const token = req.cookies?.authToken;

    if (token) {
      console.log("🔑 Token encontrado, verificando...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (user && user.isActive) {
        req.user = user;
        console.log("✅ Usuario autenticado opcionalmente:", user.email);
      }
    } else {
      console.log("ℹ️ No hay token en cookie (opcional)");
    }
  } catch (error) {
    console.log("⚠️ Token opcional inválido:", error.message);
    // No fallar, solo continuar sin usuario
  }

  next();
};

module.exports = { cookieAuth, optionalCookieAuth };

const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");

    // Solo permitir si es rol admin
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acceso denegado: solo administradores" });
    }

    req.usuario = decoded; // puedes usarlo en otros controladores si quieres
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

module.exports = { verificarToken };

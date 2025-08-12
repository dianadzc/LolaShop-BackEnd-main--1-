// utils/jwt.js
const jwt = require("jsonwebtoken");

const generateUserToken = (user) => {
  try {
    console.log("🔑 Generando token para usuario:", user.id);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // ✅ AGREGADO: importante para saber si es admin o user
        provider: user.provider, // (opcional) si quieres saber si vino por Google o local
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Token generado exitosamente");
    return token;
  } catch (error) {
    console.error("❌ Error generando token:", error);
    throw error;
  }
};

module.exports = { generateUserToken };


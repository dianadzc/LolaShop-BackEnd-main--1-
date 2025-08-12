const express = require("express");
const authRoutes = require("./auth");
const productosRoutes = require("./productos");
const uploadRoutes = require("./uploads"); // 👈 Agrega esta línea arriba

const router = express.Router();

// Rutas de autenticación
router.use("/auth", authRoutes);


// Rutas de productos
router.use("/productos", productosRoutes);

router.use("/subir", uploadRoutes); // 👈 Agrega esta línea después de las otras rutas


// Ruta de información de la API
router.get("/", (req, res) => {
  res.json({
    message: "🚀 MirosBuy API",
    version: "1.0.0",
    status: "OK",
    database: "SQL Server",
    endpoints: {
      auth: {
        google: "/auth/google",
        callback: "/auth/google/callback",
        me: "/auth/me",
        logout: "/auth/logout",
        status: "/auth/status",
      },
      productos: {
        list: "/productos",
        create: "/productos",
        detail: "/productos/:id",
        update: "/productos/:id",
        delete: "/productos/:id",
        exportCSV: "/productos/exportar-csv", // 📥 Nuevo endpoint para exportar productos
      },
    },
    documentation: {
      auth: "Autenticación con Google OAuth 2.0",
      productos: "CRUD completo de productos y exportación a CSV",
    },
  });
});

// Ruta para verificar el estado del servidor
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;

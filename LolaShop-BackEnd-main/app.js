// app.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // ← AGREGADO
require("dotenv").config();

// Importar configuración de base de datos
const { testConnection, syncDatabase } = require("./config/database");

// Importar configuración de Passport
const passport = require("./config/passport");

// Importar todas las rutas desde el index
const routes = require("./routes");
const uploadRoutes = require("./routes/uploads"); // ← Añadimos la ruta de uploads

const app = express();

// Probar conexión a SQL Server
testConnection();

// Configuración de CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ← AGREGADO - Debe ir antes de las rutas

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de API
app.use("/api", routes);

// Ruta para manejar los uploads
app.use("/api/upload", uploadRoutes); // ← Usamos la ruta que maneja los uploads de video

// También mantener las rutas de auth sin prefijo para OAuth
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Error del servidor",
  });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    availableRoutes: {
      api: "/api",
      auth: "/auth",
      health: "/api/health",
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth disponible en: http://localhost:${PORT}/auth`);

  // Sincronizar base de datos
  await syncDatabase();
});

module.exports = app;

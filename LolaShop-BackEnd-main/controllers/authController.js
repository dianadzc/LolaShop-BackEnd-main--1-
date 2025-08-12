// controllers/authController.js
const { generateUserToken } = require("../utils/jwt");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const authController = {
  // Login manual para administradores
  adminLogin: async (req, res) => {
    try {
      console.log("🔐 Login de administrador iniciado...");
      const { email, password } = req.body;

      console.log("📧 Email recibido:", email);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
        });
      }

      // Buscar admin en la base de datos
      const admin = await User.findOne({
        where: {
          email: email,
          provider: "local", // Solo usuarios creados manualmente
          role: "admin", // Solo administradores
        },
      });

      if (!admin) {
        console.log("❌ Admin no encontrado");
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        console.log("❌ Contraseña incorrecta");
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Actualizar último login
      await User.update({ lastLogin: new Date() }, { where: { id: admin.id } });

      // Generar token
      const token = generateUserToken(admin);
      console.log("✅ Admin autenticado exitosamente:", admin.email);

      res.json({
        success: true,
        message: "Login exitoso",
        token: token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          provider: admin.provider,
        },
      });
    } catch (error) {
      console.error("❌ Error en login de admin:", error);
      res.status(500).json({
        success: false,
        message: "Error del servidor",
      });
    }
  },

  // Callback exitoso de Google OAuth (para compradores)
  googleCallback: async (req, res) => {
    try {
      console.log("🔥 Google callback ejecutándose...");
      console.log("👤 Usuario en req:", req.user ? "SÍ" : "NO");

      if (!req.user) {
        console.log("❌ No hay usuario en req.user");
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=auth_failed`
        );
      }

      // Asegurar que el usuario de Google tenga role 'user' (comprador)
      if (req.user.role !== "user") {
        await User.update({ role: "user" }, { where: { id: req.user.id } });
        req.user.role = "user";
      }

      // Generar JWT token
      console.log("🔑 Generando token JWT para comprador...");
      const token = generateUserToken(req.user);
      console.log("✅ Token generado:", token ? "SÍ" : "NO");

      // Actualizar lastLogin del usuario
      try {
        await User.update(
          { lastLogin: new Date() },
          { where: { id: req.user.id } }
        );
        console.log("✅ LastLogin actualizado");
      } catch (updateError) {
        console.log("⚠️ Error actualizando lastLogin:", updateError.message);
      }

      // Redirigir al frontend CON EL TOKEN EN LA URL
      const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${token}`;
      console.log("🏠 URL DE REDIRECCIÓN CON TOKEN:", redirectUrl);

      console.log("🚀 REDIRIGIENDO...");
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Error en Google callback:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  },

  // Crear administrador (solo para setup inicial)
  createAdmin: async (req, res) => {
    try {
      console.log("👑 Creando administrador...");
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Nombre, email y contraseña son requeridos",
        });
      }

      // Verificar si ya existe un admin con ese email
      const existingAdmin = await User.findOne({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con ese email",
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear admin
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        provider: "local",
        role: "admin",
        isActive: true,
      });

      console.log("✅ Admin creado exitosamente:", admin.email);

      res.status(201).json({
        success: true,
        message: "Administrador creado exitosamente",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("❌ Error creando admin:", error);
      res.status(500).json({
        success: false,
        message: "Error del servidor",
      });
    }
  },

  // Obtener información del usuario actual
  getCurrentUser: async (req, res) => {
    try {
      console.log("👤 Obteniendo usuario actual...");
      console.log("🔑 Usuario en req:", req.user?.id);

      const user = await User.findByPk(req.user.id);

      if (!user) {
        console.log("❌ Usuario no encontrado en BD");
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      console.log("✅ Usuario encontrado:", user.email);

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          provider: user.provider,
          role: user.role,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("❌ Error al obtener usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error del servidor",
      });
    }
  },

  // Cerrar sesión
  logout: (req, res) => {
    console.log("👋 Cerrando sesión...");

    req.logout((err) => {
      if (err) {
        console.error("❌ Error al cerrar sesión:", err);
        return res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
        });
      }

      console.log("✅ Sesión cerrada exitosamente");
      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    });
  },

  // Verificar estado de autenticación
  checkAuth: (req, res) => {
    console.log("🔍 Verificando autenticación...");
    console.log("👤 Usuario autenticado:", req.user ? "SÍ" : "NO");

    if (req.user) {
      res.json({
        success: true,
        authenticated: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          picture: req.user.picture,
          role: req.user.role,
          provider: req.user.provider,
        },
      });
    } else {
      res.json({
        success: true,
        authenticated: false,
      });
    }
  },
};

module.exports = authController;

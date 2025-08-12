// routes/auth.js
const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

// ==================== GOOGLE OAUTH (COMPRADORES) ====================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  authController.googleCallback
);

// ==================== LOGIN MANUAL (ADMINISTRADORES) ====================
router.post("/admin/login", authController.adminLogin);
router.post("/admin/create", authController.createAdmin); // Solo para setup inicial

// ==================== RUTAS PROTEGIDAS ====================
router.get("/me", authenticateToken, authController.getCurrentUser);
router.get("/check", authController.checkAuth);
router.post("/logout", authController.logout);

module.exports = router;

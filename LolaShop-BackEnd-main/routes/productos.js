// routes/productos.js
const express = require("express");
const router = express.Router();
const { descargarProductosCSV } = require("../controllers/productosController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/exportar-csv", verificarToken, descargarProductosCSV);

module.exports = router;

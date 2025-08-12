// controllers/productosController.js
const Producto = require("../models/producto");
const { Parser } = require("json2csv");

exports.descargarProductosCSV = async (req, res) => {
  try {
    const productos = await Producto.findAll();

    const fields = [
      "id",
      "nombre",
      "descripcion",
      "precio",
      "stock",
      "categoria",
      "imagen_url",
      "createdAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productos.map((p) => p.toJSON()));

    // 🔽 Aquí van los headers con UTF-8 y el nombre del archivo
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=productos.csv");

    // 🔽 Envía el contenido con BOM para que Excel reconozca UTF-8 correctamente
    res.send("\uFEFF" + csv);
  } catch (error) {
    console.error("❌ Error exportando CSV:", error);
    res.status(500).json({ error: "Error al generar el archivo CSV" });
  }
};

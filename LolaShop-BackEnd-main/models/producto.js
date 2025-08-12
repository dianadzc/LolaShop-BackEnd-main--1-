// models/producto.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Producto = sequelize.define(
  "Producto",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoria: {
      type: DataTypes.STRING,
    },
    imagen_url: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "productos", // opcional, si tu tabla tiene nombre explícito
    createdAt: "creado_en",
    updatedAt: false, // o "actualizado_en" si lo usas
  }
);

module.exports = Producto;

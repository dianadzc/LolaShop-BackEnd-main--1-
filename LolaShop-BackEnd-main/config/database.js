// config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE || "mirosbuy",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
    },
    logging: console.log, // Cambiar a false en producción
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: "utf8mb4",
      timestamps: true,
      underscored: false,
    },
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    console.log("🔄 Intentando conectar a MySQL...");
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL establecida correctamente");

    // Probar una consulta simple
    const [results] = await sequelize.query(
      "SELECT VERSION() as version, DATABASE() as database_name"
    );
    console.log("📊 MySQL Versión:", results[0].version);
    console.log("📊 Base de datos:", results[0].database_name);
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);

    if (error.original?.code === "ER_BAD_DB_ERROR") {
      console.log(
        "💡 La base de datos no existe. Créala en phpMyAdmin o ejecuta:"
      );
      console.log("   CREATE DATABASE mirosbuy CHARACTER SET utf8mb4;");
    } else if (error.original?.code === "ECONNREFUSED") {
      console.log(
        "💡 MySQL no está corriendo. Inicia XAMPP o el servicio MySQL."
      );
    } else if (error.original?.code === "ER_ACCESS_DENIED_ERROR") {
      console.log(
        "💡 Error de autenticación. Verifica usuario y contraseña en .env"
      );
    }
  }
};

// Función para sincronizar modelos
const syncDatabase = async () => {
  try {
    console.log("🔄 Sincronizando modelos con la base de datos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas correctamente");
  } catch (error) {
    console.error("❌ Error sincronizando tablas:", error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};

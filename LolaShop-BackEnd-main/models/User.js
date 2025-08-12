// models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Null para usuarios de Google OAuth
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM("google", "local"),
      defaultValue: "local",
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: true, // Crea createdAt y updatedAt automáticamente
    charset: "utf8mb4",
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["googleId"],
        where: {
          googleId: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
    ],
  }
);

// Método de instancia para actualizar último login
User.prototype.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

// Método estático para encontrar por Google ID
User.findByGoogleId = async function (googleId) {
  return await this.findOne({ where: { googleId } });
};

// Método estático para encontrar por email
User.findByEmail = async function (email) {
  return await this.findOne({ where: { email } });
};

// Método estático para encontrar administradores
User.findAdmins = async function () {
  return await this.findAll({
    where: {
      role: "admin",
      provider: "local",
    },
  });
};

// Método estático para encontrar compradores (usuarios de Google)
User.findCustomers = async function () {
  return await this.findAll({
    where: {
      role: "user",
      provider: "google",
    },
  });
};

// Método para verificar si es administrador
User.prototype.isAdmin = function () {
  return this.role === "admin" && this.provider === "local";
};

// Método para verificar si es comprador
User.prototype.isCustomer = function () {
  return this.role === "user" && this.provider === "google";
};

module.exports = User;

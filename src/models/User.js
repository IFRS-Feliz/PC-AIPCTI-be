const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      cpf: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(250),
      },
      email: {
        type: DataTypes.STRING(254),
      },
      senha: {
        type: DataTypes.STRING(300),
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: false, tableName: "usuario" }
  );

  User.associate = (models) => {
    User.hasMany(models.Projeto, {
      foreignKey: "cpfUsuario",
      onDelete: "CASCADE",
    });
  };

  return User;
};

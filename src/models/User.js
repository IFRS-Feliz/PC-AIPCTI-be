module.exports = (sequelize, DataTypes) => {
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
    { sequelize: sequelize, timestamps: false, tableName: "usuario" }
  );

  User.associate = (models) => {
    User.hasMany(models.Projeto, {
      foreignKey: "cpfUsuario",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return User;
};

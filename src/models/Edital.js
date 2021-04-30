const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Edital = sequelize.define(
    "Edital",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(300),
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
      },
      dataFim: {
        type: DataTypes.DATEONLY,
      },
      ano: {
        type: DataTypes.CHAR(4),
      },
      valorAIPCTI: {
        type: DataTypes.DECIMAL(15, 2),
      },
      dataLimitePrestacao: {
        type: DataTypes.DATEONLY,
      },
    },
    { timestamps: false, tableName: "edital" }
  );

  Edital.associate = (models) => {
    Edital.hasMany(models.Projeto, {
      foreignKey: "idEdital",
      onDelete: "CASCADE",
    });
  };

  return Edital;
};

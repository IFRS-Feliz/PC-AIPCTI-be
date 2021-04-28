module.exports = (sequelize, DataTypes) => {
  const Projeto = sequelize.define(
    "Projeto",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cpfUsuario: {
        type: DataTypes.STRING(11),
        //foreign
      },
      nome: {
        type: DataTypes.STRING(300),
      },
      valorRecebidoTotal: {
        type: DataTypes.DECIMAL(15, 2),
      },
      valorRecebidoCapital: {
        type: DataTypes.DECIMAL(15, 2),
      },
      valorRecebidoCusteio: {
        type: DataTypes.DECIMAL(15, 2),
      },
      idEdital: {
        type: DataTypes.INTEGER,
        //foreign
      },
    },
    { sequelize: sequelize, timestamps: false, tableName: "projeto" }
  );

  Projeto.associate = (models) => {
    Projeto.belongsTo(models.User, { foreignKey: "cpfUsuario" });
    Projeto.belongsTo(models.Edital, { foreignKey: "idEdital" });
  };

  return Projeto;
};

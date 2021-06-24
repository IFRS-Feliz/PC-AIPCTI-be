const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Gru = sequelize.define(
    "Gru",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      valorTotalCusteio: {
        type: DataTypes.DECIMAL(15, 2),
      },
      valorTotalCapital: {
        type: DataTypes.DECIMAL(15, 2),
      },
      idProjeto: {
        type: DataTypes.INTEGER,
        //foreign
      },
      pathAnexoGruCusteio: {
        type: DataTypes.STRING(500),
      },
      pathAnexoComprovanteCusteio: {
        type: DataTypes.STRING(500),
      },
      pathAnexoGruCapital: {
        type: DataTypes.STRING(500),
      },
      pathAnexoComprovanteCapital: {
        type: DataTypes.STRING(500),
      },
    },
    {
      timestamps: false,
      tableName: "gru",
      hooks: {
        beforeBulkDestroy: (options) => {
          options.individualHooks = true;
          return options;
        },
        afterDestroy: (gru, _) => {
          if (gru.pathAnexo) {
            fs.unlink("uploads/" + gru.pathAnexoComprovanteCusteio);
            fs.unlink("uploads/" + gru.pathAnexoGruCusteio);
            fs.unlink("uploads/" + gru.pathAnexoComprovanteCapital);
            fs.unlink("uploads/" + gru.pathAnexoGruCapital);
          }
        },
      },
    }
  );

  Gru.associate = (models) => {
    Gru.belongsTo(models.Projeto, { foreignKey: "idProjeto" });
  };

  return Gru;
};

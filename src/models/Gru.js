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
      valorTotal: {
        type: DataTypes.DECIMAL(15, 2),
      },
      idProjeto: {
        type: DataTypes.INTEGER,
        //foreign
      },
      pathAnexoGru: {
        type: DataTypes.STRING(500),
      },
      pathAnexoComprovante: {
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
            fs.unlink("uploads/" + gru.pathAnexoComprovante);
            fs.unlink("uploads/" + gru.pathAnexoGru);
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

const { DataTypes } = require("sequelize");
const fs = require("fs").promises;

module.exports = (sequelize) => {
  const Justificativa = sequelize.define(
    "Justificativa",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idItem: {
        type: DataTypes.INTEGER,
        //foreign
      },
      pathAnexo: {
        type: DataTypes.STRING(500),
      },
    },
    {
      timestamps: false,
      tableName: "justificativa",
      hooks: {
        beforeBulkDestroy: (options) => {
          options.individualHooks = true;
          return options;
        },
        afterDestroy: (justificativa, _) => {
          if (justificativa.pathAnexo) {
            fs.unlink("uploads/" + justificativa.pathAnexo);
          }
        },
      },
    }
  );

  Justificativa.associate = (models) => {
    Justificativa.belongsTo(models.Item, { foreignKey: "idItem", hooks: true });
  };
};

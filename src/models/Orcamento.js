const { DataTypes } = require("sequelize");
const fs = require("fs").promises;

module.exports = (sequelize) => {
  const Orcamento = sequelize.define(
    "Orcamento",
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
      dataOrcamento: {
        type: DataTypes.DATEONLY,
      },
      nomeMaterialServico: {
        type: DataTypes.STRING(300),
      },
      marca: {
        type: DataTypes.STRING(50),
      },
      modelo: {
        type: DataTypes.STRING(50),
      },
      cnpjFavorecido: {
        type: DataTypes.STRING(14),
      },
      frete: {
        type: DataTypes.DECIMAL(15, 2),
      },
      quantidade: {
        type: DataTypes.INTEGER,
      },
      valorUnitario: {
        type: DataTypes.DECIMAL(15, 2),
      },
      valorTotal: {
        type: DataTypes.DECIMAL(15, 2),
      },
      isOrcadoComCpfCoordenador: {
        type: DataTypes.BOOLEAN,
      },
      isOrcamentoCompra: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: false,
      tableName: "orcamento",
      hooks: {
        beforeBulkDestroy: (options) => {
          options.individualHooks = true;
          return options;
        },
        afterDestroy: (orcamento, _) => {
          if (orcamento.pathAnexo) {
            fs.unlink("uploads/" + orcamento.pathAnexo);
          }
        },
      },
    }
  );

  Orcamento.associate = (models) => {
    Orcamento.belongsTo(models.Item, { foreignKey: "idItem", hooks: true });
  };

  return Orcamento;
};

const { DataTypes } = require("sequelize");
const fs = require("fs").promises;

module.exports = (sequelize) => {
  const Item = sequelize.define(
    "Item",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idProjeto: {
        type: DataTypes.INTEGER,
        //foreign
      },
      pathAnexo: {
        type: DataTypes.STRING(500),
      },
      descricao: {
        type: DataTypes.STRING(300),
      },
      despesa: {
        type: DataTypes.CHAR(7),
      },
      tipo: {
        type: DataTypes.STRING(30),
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
      dataCompraContratacao: {
        type: DataTypes.DATEONLY,
      },
      cnpjFavorecido: {
        type: DataTypes.STRING(14),
      },
      numeroDocumentoFiscal: {
        type: DataTypes.STRING(50),
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
      tipoDocumentoFiscal: {
        type: DataTypes.STRING(50),
      },
      isCompradoComCpfCoordenador: {
        type: DataTypes.BOOLEAN,
      },
      isNaturezaSingular: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: false,
      tableName: "item",
      hooks: {
        beforeBulkDestroy: (options) => {
          options.individualHooks = true;
          return options;
        },
        afterDestroy: (item, _) => {
          if (item.pathAnexo) {
            fs.unlink("uploads/" + item.pathAnexo);
          }
        },
      },
    }
  );

  Item.associate = (models) => {
    Item.hasMany(models.Orcamento, {
      foreignKey: "idItem",
      onDelete: "CASCADE",
      hooks: true,
    });
    Item.hasOne(models.Justificativa, {
      foreignKey: "idItem",
      onDelete: "CASCADE",
      hooks: true,
    });
    Item.belongsTo(models.Projeto, { foreignKey: "idProjeto" });
  };

  return Item;
};

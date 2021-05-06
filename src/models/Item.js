const { DataTypes } = require("sequelize");

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
    },
    { timestamps: false, tableName: "item" }
  );

  Item.associate = (models) => {
    Item.hasMany(models.Orcamento, {
      foreignKey: "idItem",
      onDelete: "CASCADE",
    });
    Item.belongsTo(models.Projeto, { foreignKey: "idProjeto" });
  };

  return Item;
};

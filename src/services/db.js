require("dotenv").config();
const { Sequelize } = require("sequelize");

const options = {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
};

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  options
);

// pegar as funcoes de definicao dos models
const modelDefiners = [
  require("../models/User"),
  require("../models/Edital"),
  require("../models/Projeto"),
  require("../models/Item"),
  require("../models/Orcamento"),
];

// definir cada model
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// definir associacoes entre os models de acordo com suas funcoes associate
Object.keys(sequelize.models).forEach((modelName) => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

module.exports = sequelize;

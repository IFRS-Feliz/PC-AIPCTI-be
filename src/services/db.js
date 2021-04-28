require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const User = require("../models/User");
const Edital = require("../models/Edital");
const Projeto = require("../models/Projeto");

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

//iniciar os models
User(sequelize, DataTypes);
Edital(sequelize, DataTypes);
Projeto(sequelize, DataTypes);

//setar associacoes entre as tabelas
sequelize.models.User.associate(sequelize.models);
sequelize.models.Edital.associate(sequelize.models);
sequelize.models.Projeto.associate(sequelize.models);

module.exports = sequelize;

const sequelize = require("../services/db");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const User = sequelize.models.User;
const Edital = sequelize.models.Edital;
const Projeto = sequelize.models.Projeto;

module.exports = {
  getUsuario: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const q = req.query.q;

    //adicionar condicoes no or, dependendo se o q pode ser um numero
    let or = [{ nome: { [Op.like]: `%${q}%` } }];

    if (!isNaN(q)) {
      or[1] = { cpf: { [Op.like]: `%${q}%` } };
    }

    const results = await User.findAll({ where: { [Op.or]: or } });
    res.json({ results, user: req.user, token: req.token });
  },
  getEdital: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const q = req.query.q;

    const results = await Edital.findAll({
      where: { nome: { [Op.like]: `%${q}%` } },
    });

    res.json({ results, user: req.user, token: req.token });
  },
  getProjeto: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const q = req.query.q;

    const results = await Projeto.findAll({
      where: { nome: { [Op.like]: `%${q}%` } },
    });

    res.json({ results, user: req.user, token: req.token });
  },
};

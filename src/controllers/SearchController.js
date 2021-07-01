const sequelize = require("../db");
const { Op } = require("sequelize");
const User = sequelize.models.User;
const Edital = sequelize.models.Edital;
const Projeto = sequelize.models.Projeto;

module.exports = {
  getUsuario: async (req, res) => {
    const q = req.query.q;

    //adicionar condicoes no or, dependendo se o q pode ser um numero
    let or = [{ nome: { [Op.like]: `%${q}%` } }];

    if (!isNaN(q)) {
      or[1] = { cpf: { [Op.like]: `%${q}%` } };
    }

    const results = await User.findAll({
      where: { [Op.or]: or },
      attributes: { exclude: ["senha"] },
    });
    res.json({ results, user: req.user, token: req.token });
  },
  getEdital: async (req, res) => {
    const q = req.query.q;

    //adicionar condicoes no or, dependendo se o q pode ser um numero
    let or = [{ nome: { [Op.like]: `%${q}%` } }];

    if (!isNaN(q)) {
      or[1] = { ano: { [Op.like]: `%${q}%` } };
    }

    const results = await Edital.findAll({
      where: { [Op.or]: or },
    });

    res.json({ results, user: req.user, token: req.token });
  },
  getProjeto: async (req, res) => {
    const q = req.query.q;

    const results = await Projeto.findAll({
      where: { nome: { [Op.like]: `%${q}%` } },
    });

    res.json({ results, user: req.user, token: req.token });
  },
};

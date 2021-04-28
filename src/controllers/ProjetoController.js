const { validationResult } = require("express-validator");
const Projeto = require("../services/db").models.Projeto;

module.exports = {
  get: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    let where = {};
    if (req.query.cpfUsuario) where.cpfUsuario = req.query.cpfUsuario;
    if (req.query.idEdital) where.idEdital = req.query.idEdital;

    const projetos = await Projeto.findAll({ where: where, raw: true });

    res.json({
      user: req.user,
      token: req.token,
      results: projetos,
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Projeto.bulkCreate(req.body.projetos);

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    console.log(req.body.projetos);

    const results = await Projeto.bulkCreate(req.body.projetos, {
      updateOnDuplicate: [
        "cpfUsuario",
        "nome",
        "valorRecebidoTotal",
        "valorRecebidoCapital",
        "valorRecebidoCusteio",
        "idEdital",
      ],
    });

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const ids = req.body.projetos.map((projeto) => projeto.id);

    const results = await Projeto.destroy({ where: { id: ids } });

    res
      .status(200)
      .json({ token: req.token, user: req.user, results: results });
  },
};

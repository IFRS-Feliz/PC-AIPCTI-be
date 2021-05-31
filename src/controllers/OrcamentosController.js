const { validationResult } = require("express-validator");
const sequelize = require("../services/db");
const Orcamento = sequelize.models.Orcamento;

module.exports = {
  get: async (req, res) => {
    const orcamentos = res.results;

    res.json({
      user: req.user,
      token: req.token,
      results: orcamentos,
      previous: res.previousPage,
      next: res.nextPage,
    });
  },
  getSingle: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }
    const orcamento = await Orcamento.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [orcamento],
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Orcamento.bulkCreate(req.body.orcamentos);

    res.json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Orcamento.bulkCreate(req.body.orcamentos, {
      updateOnDuplicate: [
        "idItem",
        "dataOrcamento",
        "nomeMaterialServico",
        "marca",
        "modelo",
        "cnpjFavorecido",
        "frete",
        "quantidade",
        "valorUnitario",
        "valorTotal",
        "isOrcadoComCpfCoordenador",
      ],
    });

    res.json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const ids = req.body.orcamentos.map((orcamento) => orcamento.id);

    const results = await Orcamento.destroy({ where: { id: ids } });

    res.json({ user: req.user, token: req.token, results: results });
  },
};

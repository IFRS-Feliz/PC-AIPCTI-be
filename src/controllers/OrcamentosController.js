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
    const orcamentos = await Orcamento.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [orcamentos],
    });
  },
};

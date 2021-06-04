const { validationResult } = require("express-validator");
const sequelize = require("../services/db");
const Justificativa = sequelize.models.Justificativa;

module.exports = {
  get: async (req, res) => {
    const justificativas = res.results;

    res.json({
      user: req.user,
      token: req.token,
      results: justificativas,
      previous: res.previousPage,
      next: res.nextPage,
    });
  },
  getSingle: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }
    const justificativa = await Justificativa.findByPk(req.params.id, {
      raw: true,
    });

    return res.json({
      user: req.user,
      token: req.token,
      results: [justificativa],
    });
  },
  post: async (req, res) => {
    const idItem = req.body.idItem;
    const results = await Justificativa.create({ idItem });

    return res.json({
      user: req.user,
      token: req.token,
      results: [results],
    });
  },
  deleteSingle: async (req, res) => {
    const id = req.params.id;

    const results = await Justificativa.destroy({ where: { id: id } });

    res.json({ user: req.user, token: req.token, results: results });
  },
};

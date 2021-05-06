const { validationResult } = require("express-validator");
const sequelize = require("../services/db");
const Item = sequelize.models.Item;

module.exports = {
  get: async (req, res) => {
    const itens = res.results;

    res.json({
      user: req.user,
      token: req.token,
      results: itens,
      previous: res.previousPage,
      next: res.nextPage,
    });
  },
  getSingle: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }
    const itens = await Item.findByPk(req.params.id, { raw: true });
    console.log(itens, 1);

    return res.json({
      user: req.user,
      token: req.token,
      results: [itens],
    });
  },
};

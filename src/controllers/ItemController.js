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

    return res.json({
      user: req.user,
      token: req.token,
      results: [itens],
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Item.bulkCreate(req.body.itens);

    res.json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Item.bulkCreate(req.body.itens, {
      updateOnDuplicate: [
        "idProjeto",
        // "pathAnexo",
        "descricao",
        "despesa",
        "tipo",
        "nomeMaterialServico",
        "marca",
        "modelo",
        "dataCompraContratacao",
        "cnpjFavorecido",
        "numeroDocumentoFiscal",
        "frete",
        "quantidade",
        "valorUnitario",
        "valorTotal",
        // "tipoDocumentoFiscal",
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

    const ids = req.body.itens.map((item) => item.id);

    const results = await Item.destroy({ where: { id: ids } });

    res.json({ user: req.user, token: req.token, results: results });
  },
};

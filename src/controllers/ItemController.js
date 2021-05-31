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
    const item = await Item.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [item],
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Item.bulkCreate(req.body.itens, { raw: true });

    res.json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Item.bulkCreate(req.body.itens, {
      updateOnDuplicate: [
        "idProjeto",
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
        "tipoDocumentoFiscal",
        "isCompradoComCpfCoordenador",
        "isNaturezaSingular",
      ],
    });

    res.json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const ids = req.body.itens.map((item) => item.id);

    const itens = await Item.findAll({
      where: { id: ids },
    });

    itens.forEach((item) => {
      item.destroy();
    });

    res.json({ user: req.user, token: req.token, results: itens.length });
  },
};

const {
  query,
  param,
  body,
  oneOf,
  validationResult,
} = require("express-validator");
const sequelize = require("../services/db");
const Item = sequelize.models.Item;
const { numberSanitizer, intSanitizer } = require("../middleware");

const validatorsGet = [query("idProjeto").isInt().optional()];
const validatorsGetSingle = [param("id").isInt()];
const validatorsPostPut = [
  body("itens").isArray(),
  oneOf([
    body("itens.*.descricao").isString().optional(),
    body("itens.*.descricao").isEmpty().optional(),
  ]),
  body("itens.*.despesa").customSanitizer((value) => {
    return !["custeio", "capital"].includes(value) ? "custeio" : value;
  }),
  body("itens.*.tipo").customSanitizer((value) => {
    return ![
      "materialConsumo",
      "materialPermanente",
      "servicoPessoaFisica",
      "servicoPessoaJuridica",
      "hospedagem",
      "passagem",
      "alimentacao",
    ].includes(value)
      ? "materialConsumo"
      : value;
  }),
  oneOf([
    body("itens.*.nomeMaterialServico").isString().optional(),
    body("itens.*.nomeMaterialServico").isEmpty().optional(),
  ]),
  oneOf([
    body("itens.*.marca").isString().optional(),
    body("itens.*.marca").isEmpty().optional(),
  ]),
  oneOf([
    body("itens.*.modelo").isString().optional(),
    body("itens.*.modelo").isEmpty().optional(),
  ]),
  oneOf([
    body("itens.*.dataCompraContratacao").isDate().optional(),
    body("itens.*.dataCompraContratacao").isEmpty().optional(),
  ]),
  oneOf([
    body("itens.*.cnpjFavorecido").isInt().isLength(14).optional(),
    body("itens.*.cnpjFavorecido").isEmpty().optional(),
  ]),
  oneOf([
    body("itens.*.numeroDocumentoFiscal").isInt().optional(),
    body("itens.*.numeroDocumentoFiscal").isEmpty().optional(),
  ]),
  body("itens.*.frete").customSanitizer(numberSanitizer),
  body("itens.*.quantidade").customSanitizer(intSanitizer),
  body("itens.*.valorUnitario").customSanitizer(numberSanitizer),
  body("itens.*.valorTotal").customSanitizer(numberSanitizer),
  body("itens.*.tipoDocumentoFiscal").customSanitizer((value) => {
    return !["nf", "cf", "passagem"].includes(value) ? "nf" : value;
  }),
  body("itens.*.isCompradoComCpfCoordenador").toBoolean(true),
  body("itens.*.isNaturezaSingular").toBoolean(true),
];
const validatorsPost = validatorsPostPut.concat([
  body("itens.*.idProjeto").isInt(),
  body("itens.*.posicao").isInt(),
]);
const validatorsPut = validatorsPostPut.concat([
  body("itens.*.id").isInt(),
  body("itens.*.idProjeto").isInt().optional(),
  body("itens.*.posicao").isInt().optional(),
]);
const validatorsDel = [body("itens").isArray(), body("itens.*.id").isInt()];

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
      console.log(validationResult(req));
      return res.sendStatus(400);
    }

    const results = await Item.bulkCreate(req.body.itens, { raw: true });

    res.json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      console.log(validationResult(req));
      return res.sendStatus(400);
    }

    let results;
    // caso seja para atualizar a posicao dos itens no relatorio, nao atualizar o resto
    if (req.query.posicoes) {
      results = await Item.bulkCreate(req.body.itens, {
        updateOnDuplicate: ["posicao"],
      });
    } else {
      results = await Item.bulkCreate(req.body.itens, {
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
    }

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
  validatorsGet,
  validatorsGetSingle,
  validatorsPost,
  validatorsPut,
  validatorsDel,
};

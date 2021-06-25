const { query, param, body, oneOf } = require("express-validator");
const sequelize = require("../db");
const Orcamento = sequelize.models.Orcamento;
const {
  numberSanitizer,
  intSanitizer,
  dataSanitizer,
} = require("../middleware");

const validatorsGet = [query("idItem").isInt().optional()];
const validatorsGetSingle = [param("id").isInt()];
const validatorsPostPut = [
  body("orcamentos").isArray(),
  oneOf([
    body("orcamentos.*.dataOrcamento").isDate().optional(),
    body("orcamentos.*.dataOrcamento").isEmpty().optional(),
    body("orcamentos.*.dataOrcamento").customSanitizer(dataSanitizer),
  ]),
  oneOf([
    body("orcamentos.*.nomeMaterialServico")
      .isString()
      .optional({ nullable: true }),
    body("orcamentos.*.nomeMaterialServico")
      .isEmpty()
      .optional({ nullable: true }),
  ]),
  oneOf([
    body("orcamentos.*.marca").isString().optional({ nullable: true }),
    body("orcamentos.*.marca").isEmpty().optional({ nullable: true }),
  ]),
  oneOf([
    body("orcamentos.*.modelo").isString().optional({ nullable: true }),
    body("orcamentos.*.modelo").isEmpty().optional({ nullable: true }),
  ]),
  body("orcamentos.*.cnpjFavorecido").customSanitizer((value) =>
    !value ? null : value
  ),
  oneOf([
    body("orcamentos.*.cnpjFavorecido")
      .isInt()
      .isLength(14)
      .optional({ nullable: true }),
    body("orcamentos.*.cnpjFavorecido").isEmpty().optional({ nullable: true }),
  ]),
  body("orcamentos.*.frete").customSanitizer(numberSanitizer),
  body("orcamentos.*.quantidade").customSanitizer(intSanitizer),
  body("orcamentos.*.valorUnitario").customSanitizer(numberSanitizer),
  body("orcamentos.*.valorTotal").customSanitizer(numberSanitizer),
  body("orcamentos.*.isOrcadoComCpfCoordenador").toBoolean(true),
  body("orcamentos.*.isOrcamentoCompra").toBoolean(true),
];
const validatorsPost = validatorsPostPut.concat([
  body("orcamentos.*.idItem").isInt(),
]);
const validatorsPut = validatorsPostPut.concat([
  body("orcamentos.*.id").isInt(),
  body("orcamentos.*.idItem").isInt().optional(),
]);
const validatorsDel = [
  body("orcamentos").isArray(),
  body("orcamentos.*.id").isInt(),
];

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
    const orcamento = await Orcamento.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [orcamento],
    });
  },
  post: async (req, res) => {
    const results = await Orcamento.bulkCreate(req.body.orcamentos);

    res.json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
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
        "isOrcamentoCompra",
      ],
    });

    res.json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    const ids = req.body.orcamentos.map((orcamento) => orcamento.id);

    const results = await Orcamento.destroy({ where: { id: ids } });

    res.json({ user: req.user, token: req.token, results: results });
  },
  validatorsGet,
  validatorsGetSingle,
  validatorsPost,
  validatorsPut,
  validatorsDel,
};

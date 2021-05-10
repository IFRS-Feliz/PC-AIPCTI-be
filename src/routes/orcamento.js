const express = require("express");
const router = express.Router();

const { query, param, body } = require("express-validator");

const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;

const {
  get,
  getSingle,
  post,
  put,
  del,
} = require("../controllers/OrcamentosController");
const Orcamento = require("../services/db").models.Orcamento;

router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(
    query("idItem").isInt().optional(),
    query("limit").isInt().optional(),
    query("page").isInt().optional(),
    paginatedResults(Orcamento),
    get
  );

router.route("/:id").get(param("id").isInt(), getSingle);

router
  .route("/")
  .delete(
    body("orcamentos").isArray(),
    body("orcamentos.*.id").isNumeric(),
    del
  )
  .post(
    body("orcamentos").isArray(),
    body("orcamentos.*.idItem").isInt(),
    // body("pathAnexo").isAlphanumeric(),
    body("orcamentos.*.dataOrcamento").isDate(),
    body("orcamentos.*.nomeMaterialServico").isString(),
    body("orcamentos.*.marca").isString(),
    body("orcamentos.*.modelo").isString(),
    body("orcamentos.*.cnpjFavorecido").isInt().isLength(14),
    body("orcamentos.*.frete").isNumeric(),
    body("orcamentos.*.quantidade").isInt(),
    body("orcamentos.*.valorUnitario").isNumeric(),
    body("orcamentos.*.valorTotal").isNumeric(),
    post
  )
  .put(
    body("orcamentos").isArray().isLength({ min: 1 }),
    body("orcamentos.*.id").isInt(),
    body("orcamentos.*.idItem").isInt(),
    // body("pathAnexo").isAlphanumeric(),
    body("orcamentos.*.dataOrcamento").isDate(),
    body("orcamentos.*.nomeMaterialServico").isString(),
    body("orcamentos.*.marca").isString(),
    body("orcamentos.*.modelo").isString(),
    body("orcamentos.*.cnpjFavorecido").isInt().isLength(14),
    body("orcamentos.*.frete").isNumeric(),
    body("orcamentos.*.quantidade").isInt(),
    body("orcamentos.*.valorUnitario").isNumeric(),
    body("orcamentos.*.valorTotal").isNumeric(),
    put
  );

module.exports = router;

const express = require("express");
const router = express.Router();

const { query, param, body } = require("express-validator");

const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;

//controller methods
const {
  get,
  getSingle,
  post,
  put,
  del,
} = require("../controllers/ItemController");
const {
  getFile,
  postFile,
  deleteFile,
} = require("../controllers/FileController");
const Item = require("../services/db").models.Item;

router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(
    query("idProjeto").isInt().optional(),
    query("limit").isInt().optional(),
    query("page").isInt().optional(),
    paginatedResults(Item),
    get
  );

router.route("/:id").get(param("id").isInt(), getSingle);

router
  .route("/")
  .post(
    body("itens").isArray(),
    body("itens.*.idProjeto").isInt(),
    body("itens.*.descricao").isString(),
    body("itens.*.despesa").isString(),
    body("itens.*.tipo").isString(),
    body("itens.*.nomeMaterialServico").isString(),
    body("itens.*.marca").isString(),
    body("itens.*.modelo").isString(),
    body("itens.*.dataCompraContratacao").isDate(),
    body("itens.*.cnpjFavorecido").isInt().isLength(14),
    body("itens.*.numeroDocumentoFiscal").isInt(),
    body("itens.*.frete").isNumeric(),
    body("itens.*.quantidade").isInt(),
    body("itens.*.valorUnitario").isNumeric(),
    body("itens.*.valorTotal").isNumeric(),
    body("itens.*.tipoDocumentoFiscal").isString(),
    body("itens.*.isCompradoComCpfCoordenador").isBoolean(),
    post
  )
  .put(
    body("itens").isArray(),
    body("itens.*.id").isInt(),
    body("itens.*.idProjeto").isInt(),
    body("itens.*.descricao").isString(),
    body("itens.*.despesa").isString(),
    body("itens.*.tipo").isString(),
    body("itens.*.nomeMaterialServico").isString(),
    body("itens.*.marca").isString(),
    body("itens.*.modelo").isString(),
    body("itens.*.dataCompraContratacao").isDate(),
    body("itens.*.cnpjFavorecido").isInt().isLength(14),
    body("itens.*.numeroDocumentoFiscal").isInt(),
    body("itens.*.frete").isNumeric(),
    body("itens.*.quantidade").isInt(),
    body("itens.*.valorUnitario").isNumeric(),
    body("itens.*.valorTotal").isNumeric(),
    body("itens.*.tipoDocumentoFiscal").isString(),
    body("itens.*.isCompradoComCpfCoordenador").isBoolean(),
    put
  )
  .delete((body("itens").isArray(), body("itens.*.id").isNumeric(), del));

//files
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.route("/:id/file").get(getFile(Item));

router.route("/:id/file").post(upload.single("file"), postFile(Item));

router.route("/:id/file").delete(deleteFile(Item));

module.exports = router;

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
    body("itens.*.descricao").isString().optional(),
    body("itens.*.despesa").isString().optional(),
    body("itens.*.tipo").isString().optional(),
    body("itens.*.nomeMaterialServico").isString().optional(),
    body("itens.*.marca").isString().optional(),
    body("itens.*.modelo").isString().optional(),
    body("itens.*.dataCompraContratacao").isDate().optional(),
    body("itens.*.cnpjFavorecido").isInt().isLength(14).optional(),
    body("itens.*.numeroDocumentoFiscal").isInt().optional(),
    body("itens.*.frete").isNumeric().optional(),
    body("itens.*.quantidade").isInt().optional(),
    body("itens.*.valorUnitario").isNumeric().optional(),
    body("itens.*.valorTotal").isNumeric().optional(),
    body("itens.*.tipoDocumentoFiscal").isString().optional(),
    body("itens.*.isCompradoComCpfCoordenador").isBoolean().optional(),
    body("itens.*.posicao").isInt().optional(),
    post
  )
  .put(
    body("itens").isArray(),
    body("itens.*.id").isInt(),
    body("itens.*.idProjeto").isInt().optional(),
    body("itens.*.descricao").isString().optional(),
    body("itens.*.despesa").isString().optional(),
    body("itens.*.tipo").isString().optional(),
    body("itens.*.nomeMaterialServico").isString().optional(),
    body("itens.*.marca").isString().optional(),
    body("itens.*.modelo").isString().optional(),
    body("itens.*.dataCompraContratacao").isDate().optional(),
    body("itens.*.cnpjFavorecido").isInt().isLength(14).optional(),
    body("itens.*.numeroDocumentoFiscal").isInt().optional(),
    body("itens.*.frete").isNumeric().optional(),
    body("itens.*.quantidade").isInt().optional(),
    body("itens.*.valorUnitario").isNumeric().optional(),
    body("itens.*.valorTotal").isNumeric().optional(),
    body("itens.*.tipoDocumentoFiscal").isString().optional(),
    body("itens.*.isCompradoComCpfCoordenador").isBoolean().optional(),
    body("itens.*.posicao").isInt().optional(),
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

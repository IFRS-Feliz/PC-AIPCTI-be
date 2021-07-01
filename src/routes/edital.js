const express = require("express");
const router = express.Router();

const { body, query, param } = require("express-validator");
const { checkValidations } = require("../middleware/errorHandling");

//controller methods
const {
  get,
  post,
  put,
  del,
  getSingle,
} = require("../controllers/EditalController");
const Edital = require("../db").models.Edital;

//setup authorization middleware
const { auth: authorization, paginatedResults } = require("../middleware");
router.use(authorization(false)); //nao é necessario ser admin para realizar get

router.route("/").get(
  query("limit").isInt().optional(),
  query("page").isInt().optional(),
  query("sortBy").customSanitizer((value) =>
    ["id", "nome", "dataInicio"].includes(value) ? value : "nome"
  ),
  query("order").customSanitizer((value) =>
    ["ASC", "DESC"].includes(value) ? value : "ASC"
  ),
  paginatedResults(Edital),
  get
);

router.route("/:id").get(param("id").isInt(), checkValidations, getSingle);

router.use(authorization(true)); //é necessario ser admin para outros metodos

router
  .route("/")
  .delete(body("id").isInt(), checkValidations, del)
  .post(
    body("nome").exists(),
    body("dataInicio").isDate(),
    body("dataFim").isDate(),
    body("dataLimitePrestacao").isDate(),
    body("valorAIPCTI").isNumeric(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
    checkValidations,
    post
  )
  .put(
    body("id").isInt(),
    body("nome").exists(),
    body("dataInicio").isDate(),
    body("dataFim").isDate(),
    body("dataLimitePrestacao").isDate(),
    body("valorAIPCTI").isNumeric(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
    checkValidations,
    put
  );

module.exports = router;

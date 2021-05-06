const express = require("express");
const router = express.Router();

const { query, param } = require("express-validator");

const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;

const { get, getSingle } = require("../controllers/OrcamentosController");
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

module.exports = router;

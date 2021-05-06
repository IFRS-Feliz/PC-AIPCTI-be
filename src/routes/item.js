const express = require("express");
const router = express.Router();

const { query, param } = require("express-validator");

const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;

//controller methods
const { get, getSingle } = require("../controllers/ItemController");
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

module.exports = router;

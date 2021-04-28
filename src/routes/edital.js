const express = require("express");
const router = express.Router();

const { body, query } = require("express-validator");

//controller methods
const { get, post, put, del } = require("../controllers/EditalController");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(query("id").isInt().optional(), get)
  .delete(body("id").isInt(), del)
  .post(
    body("nome").exists(),
    body("dataInicio").isDate(),
    body("dataFim").isDate(),
    body("dataLimitePrestacao").isDate(),
    body("valorAIPCTI").isNumeric(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
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
    put
  );

module.exports = router;

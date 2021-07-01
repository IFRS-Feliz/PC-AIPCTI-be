const express = require("express");
const router = express.Router();

const { query } = require("express-validator");
const { auth: authentication } = require("../middleware");
const { checkValidations } = require("../middleware/errorHandling");

//controller methods
const {
  getUsuario,
  getEdital,
  getProjeto,
} = require("../controllers/SearchController");

router.use(authentication(false));

router.use(
  query("q")
    .isString()
    .trim()
    //remover caracteres nao alfanumericos
    .customSanitizer((q) => q.replace(/[^0-9a-zA-Z ]/g, "")),
  checkValidations
);

router.route("/usuario").get(getUsuario);

router.route("/edital").get(getEdital);

router.route("/projeto").get(getProjeto);

module.exports = router;

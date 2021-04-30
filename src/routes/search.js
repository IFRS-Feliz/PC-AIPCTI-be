const express = require("express");
const router = express.Router();

const { query } = require("express-validator");
const authentication = require("../middleware").auth;

//controller methods
const {
  getUsuario,
  getEdital,
  getProjeto,
} = require("../controllers/SearchController");

router.use(authentication(false));

router.use(query("q").isAlphanumeric());

router.route("/usuario").get(getUsuario);

router.route("/edital").get(getEdital);

router.route("/projeto").get(getProjeto);

module.exports = router;

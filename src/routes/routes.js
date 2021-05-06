const express = require("express");
const router = express.Router();

const auth = require("./auth");
const projeto = require("./projeto");
const usuario = require("./usuario");
const edital = require("./edital");
const search = require("./search");
const item = require("./item");
const orcamento = require("./orcamento");

router.use("/auth", auth);

router.use("/usuario", usuario);

router.use("/projeto", projeto);

router.use("/edital", edital);

router.use("/search", search);

router.use("/item", item);

router.use("/orcamento", orcamento);

module.exports = router;

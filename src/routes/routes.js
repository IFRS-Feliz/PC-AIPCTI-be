const express = require("express");
const router = express.Router();

const auth = require("./auth");
const projeto = require("./projeto");
const usuario = require("./usuario");
const edital = require("./edital");
const search = require("./search");

router.use("/auth", auth);

router.use("/usuario", usuario);

router.use("/projeto", projeto);

router.use("/edital", edital);

router.use("/search", search);

module.exports = router;

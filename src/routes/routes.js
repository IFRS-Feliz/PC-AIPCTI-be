const express = require("express");
const router = express.Router();

const auth = require("./auth");
const projeto = require("./projeto");
const usuario = require("./usuario");
const edital = require("./edital");

router.use("/auth", auth);

router.use("/usuario", usuario);

router.use("/projeto", projeto);

router.use("/edital", edital);

module.exports = router;

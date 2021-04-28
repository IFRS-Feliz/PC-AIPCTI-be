const express = require("express");
const router = express.Router();

//controller methods
const { login, logout } = require("../controllers/AuthController");

router.route("/login").post(login);

router.route("/logout").get(logout);

module.exports = router;

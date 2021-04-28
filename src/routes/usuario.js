const express = require("express");
const router = express.Router();

const { body, query } = require("express-validator");

//controller methods
const { get, post, put, del } = require("../controllers/UserController");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(query("cpf").isLength({ min: 11, max: 11 }).isInt().optional(), get)
  .delete(body("cpf").isLength({ min: 11, max: 11 }).isInt(), del)
  .post(
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    post
  )
  .put(
    //nao é possivel alterar o cpf
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    put
  );

module.exports = router;

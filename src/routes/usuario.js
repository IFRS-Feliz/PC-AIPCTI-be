const express = require("express");
const router = express.Router();

const { body, query, param } = require("express-validator");
const { checkValidations } = require("../errorHandling");

//controller methods
const {
  get,
  post,
  put,
  del,
  getSingle,
  changePassword,
} = require("../controllers/UserController");
const User = require("../services/db").models.User;

//setup authorization middleware
const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;
router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(
    query("limit").isInt().optional(),
    query("page").isInt().optional(),
    paginatedResults(User, { isAdmin: false }),
    get
  );

router
  .route("/:cpf")
  .get(
    param("cpf").isLength({ min: 11, max: 11 }).isInt(),
    checkValidations,
    getSingle
  );

router
  .route("/:cpf/senha")
  .put(
    param("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("password").isString(),
    checkValidations,
    changePassword
  );

router.use(authorization(true)); //é necessario ser admin para outros metodos

router
  .route("/")
  .delete(
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    checkValidations.apply,
    del
  )
  .post(
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    checkValidations,
    post
  )
  .put(
    //nao é possivel alterar o cpf
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    checkValidations,
    put
  );

module.exports = router;

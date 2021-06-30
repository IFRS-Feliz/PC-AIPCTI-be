const express = require("express");
const router = express.Router();

const { body, query, param } = require("express-validator");
const { checkValidations } = require("../middleware/errorHandling");

//controller methods
const {
  get,
  post,
  put,
  del,
  getSingle,
  changePassword,
} = require("../controllers/UserController");
const User = require("../db").models.User;

//setup authorization middleware
const { auth: authorization, paginatedResults } = require("../middleware");
const { enforceOwnerByCpfParam } = require("../middleware/enforceOwner");
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

router.route("/:cpf/senha").put(
  param("cpf").isLength({ min: 11, max: 11 }).isInt(),
  body("password").isString().optional(), //nao necessaria caso admin esteja resetando
  enforceOwnerByCpfParam, //é necessario ser o proprio usuario (ou admin)
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

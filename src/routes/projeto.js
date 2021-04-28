const express = require("express");
const router = express.Router();

const { query, body } = require("express-validator");

//controller methods
const { get, post, put, del } = require("../controllers/ProjetoController");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(
    query("cpfUsuario").isLength({ min: 11, max: 11 }).isInt().optional(),
    query("idEdital").isInt().optional(),
    get
  )
  .post(
    // body("cpfUsuario").isLength({ min: 11, max: 11 }), //cpf agora vem como propriedade do projeto para mais flexibilidade
    body("projetos.*.cpfUsuario").isLength({ min: 11, max: 11 }),
    body("projetos").isArray(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    post
  )
  .put(
    //.*. quer dizer em qualquer posicao da lista projetos
    body("projetos").isArray().isLength({ min: 1 }),
    body("projetos.*.id").isNumeric(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    body("projetos.*.cpfUsuario").isLength({ min: 11, max: 11 }),
    put
  )
  .delete(body("projetos").isArray(), body("projetos.*.id").isNumeric(), del);

module.exports = router;

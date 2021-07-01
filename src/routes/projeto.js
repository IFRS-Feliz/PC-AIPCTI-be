const express = require("express");
const router = express.Router();

const { query, body, param } = require("express-validator");
const { checkValidations } = require("../middleware/errorHandling");
const { enforceOwnerByProjetoIdParam } = require("../middleware/enforceOwner");

//controller methods
const {
  get,
  post,
  put,
  del,
  getSingle,
  getRelatorio,
} = require("../controllers/ProjetoController");
const Projeto = require("../db").models.Projeto;

//setup authorization middleware
const { auth: authorization, paginatedResults } = require("../middleware");
router.use(authorization(false)); //nao é necessario ser admin para realizar get

router.route("/").get(
  query("cpfUsuario").isLength({ min: 11, max: 11 }).isInt().optional(),
  query("idEdital").isInt().optional(),
  query("limit").isInt().optional(),
  query("page").isInt().optional(),
  query("sortBy").customSanitizer((value) =>
    ["id", "nome"].includes(value) ? value : "nome"
  ),
  query("order").customSanitizer((value) =>
    ["ASC", "DESC"].includes(value) ? value : "ASC"
  ),
  paginatedResults(Projeto),
  get
);

router.route("/:id").get(param("id").isInt(), checkValidations, getSingle);

//gru
const {
  get: getGru,
  post: postGru,
  put: putGru,
  getFile: getGruFile,
  postFile: postGruFile,
  deleteFile: deleteGruFile,
  gruFileIsComprovanteOrGru,
} = require("../controllers/GruController");

router.use("/:id/gru", param("id").isInt(), enforceOwnerByProjetoIdParam);

router
  .route("/:id/gru")
  .get(checkValidations, getGru)
  .post(
    body("gru").isObject(),
    body("gru.valorTotalCusteio").isNumeric(),
    body("gru.valorTotalCapital").isNumeric(),
    body("gru.idProjeto").isInt(),
    checkValidations,
    postGru
  )
  .put(
    body("gru").isObject(),
    body("gru.valorTotalCusteio").customSanitizer((value) =>
      !value ? 0 : value
    ),
    body("gru.valorTotalCapital").customSanitizer((value) =>
      !value ? 0 : value
    ),
    body("gru.valorTotalCusteio").isNumeric(),
    body("gru.valorTotalCapital").isNumeric(),
    checkValidations,
    putGru
  );

//gru files
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.use(
  "/:id/gru/file",
  query("type").custom(gruFileIsComprovanteOrGru),
  checkValidations
);

router.route("/:id/gru/file").get(getGruFile);

router.route("/:id/gru/file").post(upload.single("file"), postGruFile);

router.route("/:id/gru/file").delete(deleteGruFile);

//relatorio
router
  .route("/:id/relatorio")
  .get(
    param("id").isInt(),
    checkValidations,
    enforceOwnerByProjetoIdParam,
    getRelatorio
  );

//projeto
router.use(authorization(true)); //é necessario ser admin para outros metodos

router
  .route("/")
  .post(
    // body("cpfUsuario").isLength({ min: 11, max: 11 }), //cpf agora vem como propriedade do projeto para mais flexibilidade
    body("projetos.*.cpfUsuario").isLength({ min: 11, max: 11 }),
    body("projetos").isArray(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    checkValidations,
    post
  )
  .put(
    //.*. quer dizer em qualquer posicao da lista projetos
    body("projetos").isArray().isLength({ min: 1 }),
    body("projetos.*.id").isInt(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    body("projetos.*.cpfUsuario").isLength({ min: 11, max: 11 }),
    checkValidations,
    put
  )
  .delete(
    body("projetos").isArray(),
    body("projetos.*.id").isNumeric(),
    checkValidations,
    del
  );

module.exports = router;

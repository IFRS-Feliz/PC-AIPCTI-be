const express = require("express");
const router = express.Router();

const {
  auth: authorization,
  paginatedResults,
  validatorsPaginatedResults,
} = require("../middleware");

const { checkValidations } = require("../middleware/errorHandling");

const {
  get,
  getSingle,
  post,
  put,
  del,
  validatorsGet,
  validatorsGetSingle,
  validatorsPost,
  validatorsPut,
  validatorsDel,
} = require("../controllers/OrcamentosController");
const {
  getFile,
  postFile,
  deleteFile,
} = require("../controllers/FileController");
const Orcamento = require("../db").models.Orcamento;

router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(
    validatorsGet,
    validatorsPaginatedResults,
    paginatedResults(Orcamento),
    get
  );

router.route("/:id").get(validatorsGetSingle, checkValidations, getSingle);

router
  .route("/")
  .delete(validatorsDel, checkValidations, del)
  .post(validatorsPost, checkValidations, post)
  .put(validatorsPut, checkValidations, put);

//file
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.route("/:id/file").get(getFile(Orcamento));

router.route("/:id/file").post(upload.single("file"), postFile(Orcamento));

router.route("/:id/file").delete(deleteFile(Orcamento));

module.exports = router;

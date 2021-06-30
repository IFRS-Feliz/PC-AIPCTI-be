const express = require("express");
const router = express.Router();

const {
  auth: authorization,
  paginatedResults,
  validatorsPaginatedResults,
} = require("../middleware");
const { checkValidations } = require("../middleware/errorHandling");
const {
  enforceOwnerByItemIdParam,
  enforceOwnerByProjetoIdBody,
  enforceOwnerByItemIdBody,
} = require("../middleware/enforceOwner");

//controller methods
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
} = require("../controllers/ItemController");
const {
  getFile,
  postFile,
  deleteFile,
} = require("../controllers/FileController");
const Item = require("../db").models.Item;

router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(validatorsGet, validatorsPaginatedResults, paginatedResults(Item), get);

router.route("/:id").get(validatorsGetSingle, checkValidations, getSingle);

router
  .route("/")
  .post(validatorsPost, checkValidations, enforceOwnerByProjetoIdBody, post)
  .put(validatorsPut, checkValidations, enforceOwnerByProjetoIdBody, put)
  .delete(validatorsDel, checkValidations, enforceOwnerByItemIdBody, del);

//files
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.use("/:id/file", enforceOwnerByItemIdParam);

router.route("/:id/file").get(getFile(Item));

router.route("/:id/file").post(upload.single("file"), postFile(Item));

router.route("/:id/file").delete(deleteFile(Item));

module.exports = router;

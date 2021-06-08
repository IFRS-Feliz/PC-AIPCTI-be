const express = require("express");
const router = express.Router();

const {
  auth: authorization,
  paginatedResults,
  validatorsPaginatedResults,
} = require("../middleware");

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
const Item = require("../services/db").models.Item;

router.use(authorization(false)); //nao é necessario ser admin para realizar get

router
  .route("/")
  .get(validatorsGet, validatorsPaginatedResults, paginatedResults(Item), get);

router.route("/:id").get(validatorsGetSingle, getSingle);

router
  .route("/")
  .post(validatorsPost, post)
  .put(validatorsPut, put)
  .delete(validatorsDel, del);

//files
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.route("/:id/file").get(getFile(Item));

router.route("/:id/file").post(upload.single("file"), postFile(Item));

router.route("/:id/file").delete(deleteFile(Item));

module.exports = router;

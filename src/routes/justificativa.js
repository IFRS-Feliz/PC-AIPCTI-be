const express = require("express");
const router = express.Router();

const { query, param, body } = require("express-validator");

const authorization = require("../middleware").auth;
const paginatedResults = require("../middleware").paginatedResults;

router.use(authorization(false));

//controller methods
const {
  getSingle,
  get,
  post,
  deleteSingle,
} = require("../controllers/JustificativaController");
const {
  getFile,
  postFile,
  deleteFile,
} = require("../controllers/FileController");
const sequelize = require("../services/db");
const Justificativa = sequelize.models.Justificativa;

router
  .route("/")
  .get(
    query("idItem").isInt().optional(),
    query("limit").isInt().optional(),
    query("page").isInt().optional(),
    paginatedResults(Justificativa),
    get
  )
  .post(body("idItem").isInt(), post);
router
  .route("/:id")
  .get(param("id").isInt(), getSingle)
  .delete(param("id").isInt(), deleteSingle);

//file
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.route("/:id/file").get(getFile(Justificativa));

router.route("/:id/file").post(upload.single("file"), postFile(Justificativa));

router.route("/:id/file").delete(deleteFile(Justificativa));

module.exports = router;

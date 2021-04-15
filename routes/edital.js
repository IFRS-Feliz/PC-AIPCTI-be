const express = require("express");
const router = express.Router();

const connection = require("../db");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router.route("/").get((req, res) => {
  connection.query("SELECT * FROM edital", (error, results, fields) => {
    if (error) {
      throw error;
    }
    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  });
});

module.exports = router;

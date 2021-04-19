const express = require("express");
const router = express.Router();

const connection = require("../db");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router.route("/").get((req, res) => {
  connection.query("SELECT * FROM edital", (error, results, fields) => {
    if (error) {
      return res.sendStatus(500);
    }
    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  });
});

module.exports = router;

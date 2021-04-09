const express = require("express");
const router = express.Router();

const connection = require("../db").connection;

router.route("/").get((req, res) => {
  connection.query("SELECT * FROM usuario", (error, results, fields) => {
    if (error) {
      throw error;
    }
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
          results,
        });
      } else {
        res.status(403).json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: false,
        });
      }
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  });
});

module.exports = router;

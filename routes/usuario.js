const express = require("express");
const router = express.Router();

const connection = require("../db").connection;

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get((req, res) => {
    connection.query("SELECT * FROM usuario", (error, results, fields) => {
      if (error) {
        throw error;
      }

      res.json({
        isAuthenticated: true,
        email: req.session.user.email,
        isAdmin: req.session.user.isAdmin,
        results,
      });
    });
  })
  .post((req, res) => {
    connection.query(
      "INSERT INTO usuario (cpf, nome, email, senha, isAdmin) VALUES (?, ?, ?, ?, ?)",
      [req.body.cpf, req.body.nome, req.body.email, 123, req.body.isAdmin],
      (error, results, fields) => {
        if (error) {
          throw error;
        }

        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
          results,
        });
      }
    );
  });

module.exports = router;

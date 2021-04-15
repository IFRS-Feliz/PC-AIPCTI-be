const express = require("express");
const router = express.Router();

const connection = require("../db");

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
        user: req.user,
        token: req.token,
        results: results,
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

        res.status(200).json({ user: req.user, token: req.token });
      }
    );
  });

module.exports = router;

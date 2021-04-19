const express = require("express");
const router = express.Router();

const connection = require("../db");

const { body, validationResult } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router.route("/").get((req, res) => {
  connection.query("SELECT * FROM usuario", (error, results, fields) => {
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

router.use(
  body("email").isEmail(),
  body("cpf").isLength({ min: 11, max: 11 }),
  body("nome").exists(),
  body("isAdmin").exists()
);

router.post("/", (req, res) => {
  if (!validationResult(req).isEmpty()) {
    return res.sendStatus(400);
  }

  //procurar por outros usuarios com o mesmo cpf
  connection.query(
    "SELECT cpf FROM usuario WHERE cpf = ?",
    [req.body.cpf],
    (error, results) => {
      if (error) return res.sendStatus(500);

      if (results.length > 0) {
        return res
          .status(400)
          .send({ msg: "Outro usuário já possui esse CPF" });
      }

      //procurar por outros usuarios com o mesmo email
      connection.query(
        "SELECT email FROM usuario WHERE email = ?",
        [req.body.email],
        (error, results) => {
          if (error) return res.sendStatus(500);

          if (results.length > 0) {
            return res
              .status(400)
              .send({ msg: "Outro usuário já possui esse email" });
          }

          //inserir o usuario
          connection.query(
            "INSERT INTO usuario (cpf, nome, email, senha, isAdmin) VALUES (?, ?, ?, ?, ?)",
            [
              req.body.cpf,
              req.body.nome,
              req.body.email,
              123,
              req.body.isAdmin,
            ],
            (error) => {
              if (error) return res.sendStatus(500);

              res.status(200).json({ user: req.user, token: req.token });
            }
          );
        }
      );
    }
  );
});

module.exports = router;

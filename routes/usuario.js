const express = require("express");
const router = express.Router();

const connection = require("../db");

const { body, validationResult, query } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(
    query("cpf").isLength({ min: 11, max: 11 }).isInt().optional(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      let query = "SELECT * FROM usuario WHERE isAdmin = 0";
      if (req.query.cpf) {
        query += ` AND cpf = ${req.query.cpf}`;
      }

      connection.query(query, (error, results, fields) => {
        if (error) {
          return res.sendStatus(500);
        }

        res.json({
          user: req.user,
          token: req.token,
          results: results,
        });
      });
    }
  )
  .delete(body("cpf").isLength({ min: 11, max: 11 }).isInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    //deletar projetos do usuario antes de deleta-lo
    connection.query(
      "DELETE FROM projeto WHERE cpfUsuario = ?",
      [req.body.cpf],
      (error) => {
        if (error) return res.sendStatus(500);

        //deletar usuario
        connection.query(
          "DELETE FROM usuario WHERE cpf = ?",
          [req.body.cpf],
          (error) => {
            if (error) return res.sendStatus(500);

            res.status(200).send({ token: req.token, user: req.user });
          }
        );
      }
    );
  })
  .post(
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    (req, res) => {
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
                  0, //nunca será admin
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
    }
  )
  .put(
    //nao é possivel alterar o cpf
    body("email").isEmail(),
    body("cpf").isLength({ min: 11, max: 11 }).isInt(),
    body("nome").exists(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      //procurar por outros usuarios com o mesmo email
      connection.query(
        "SELECT email FROM usuario WHERE email = ? AND cpf != ?",
        [req.body.email, req.body.cpf],
        (error, results) => {
          if (error) return res.sendStatus(500);

          if (results.length > 0) {
            return res
              .status(400)
              .send({ msg: "Outro usuário já possui esse email" });
          }

          //atualizar o usuario
          connection.query(
            "UPDATE usuario SET email = ?, nome = ? WHERE cpf = ? ",
            [req.body.email, req.body.nome, req.body.cpf],
            (error) => {
              if (error) return res.sendStatus(500);

              res.status(200).json({ user: req.user, token: req.token });
            }
          );
        }
      );
    }
  );

module.exports = router;

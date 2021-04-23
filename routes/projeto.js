const express = require("express");
const router = express.Router();

const connection = require("../db");

const { query, body, validationResult } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(
    query("cpfUsuario").isLength({ min: 11, max: 11 }).isInt().optional(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      if (req.query.cpfUsuario) {
        connection.query(
          "SELECT * FROM projeto WHERE cpfUsuario=?",
          [req.query.cpfUsuario],
          (error, results) => {
            if (error) {
              return res.sendStatus(500);
            }
            return res.json({
              user: req.user,
              token: req.token,
              results: results,
            });
          }
        );
      } else {
        connection.query("SELECT * FROM projeto", (error, results) => {
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
    }
  )
  .post(
    // body("cpfUsuario").isLength({ min: 11, max: 11 }), //cpf agora vem como propriedade do projeto para mais flexibilidade
    body("projetos.*.cpfUsuario").isLength({ min: 11, max: 11 }),
    body("projetos").isArray(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      const projetos = req.body.projetos;

      let query =
        "INSERT INTO projeto (cpfUsuario, nome, valorRecebidoTotal, valorRecebidoCapital, valorRecebidoCusteio, idEdital) VALUES";

      projetos.forEach((projeto) => {
        query += `('${projeto.cpfUsuario}', '${projeto.nome}', ${projeto.valorRecebidoTotal}, ${projeto.valorRecebidoCapital}, ${projeto.valorRecebidoCusteio}, ${projeto.idEdital}),`;
      });

      query = query.substring(0, query.length - 1) + ";";

      connection.query(
        query,
        [req.body.cpf, req.body.nome, req.body.email, 123, req.body.isAdmin],
        (error, results, fields) => {
          if (error) {
            return res.sendStatus(500);
          }

          res.status(200).json({ user: req.user, token: req.token });
        }
      );
    }
  )
  .put(
    //.*. quer dizer em qualquer posicao da lista projetos
    body("projetos").isArray().isLength({ min: 1 }),
    body("projetos.*.id").isNumeric(),
    body("projetos.*.nome").exists(),
    body("projetos.*.valorRecebidoTotal").isNumeric(),
    body("projetos.*.valorRecebidoCusteio").isNumeric(),
    body("projetos.*.valorRecebidoCapital").isNumeric(),
    body("projetos.*.idEdital").isNumeric(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      let query =
        "INSERT INTO projeto (id, nome, valorRecebidoTotal, valorRecebidoCapital, valorRecebidoCusteio, idEdital) VALUES";

      req.body.projetos.forEach((projeto) => {
        query += `(${projeto.id}, "${projeto.nome}", ${projeto.valorRecebidoTotal}, ${projeto.valorRecebidoCapital}, ${projeto.valorRecebidoCusteio}, ${projeto.idEdital}),`;
      });
      query = query.substring(0, query.length - 1);

      query +=
        " ON DUPLICATE KEY UPDATE nome=VALUES(nome), valorRecebidoTotal=VALUES(valorRecebidoTotal), valorRecebidoCapital=VALUES(valorRecebidoCapital), valorRecebidoCusteio=VALUES(valorRecebidoCusteio), idEdital=VALUES(idEdital);";

      connection.query(query, (error, results, fields) => {
        if (error) {
          return res.sendStatus(500);
        }

        res.status(200).json({ user: req.user, token: req.token });
      });
    }
  )
  .delete(
    body("projetos").isArray(),
    body("projetos.*.id").isNumeric(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      let query = "DELETE FROM projeto WHERE id IN (";
      req.body.projetos.forEach((projeto) => {
        query += `${projeto.id},`;
      });
      query = query.substring(0, query.length - 1) + ");";

      connection.query(query, (error) => {
        if (error) return res.sendStatus(500);

        res.status(200).json({ token: req.token, user: req.user });
      });
    }
  );

module.exports = router;

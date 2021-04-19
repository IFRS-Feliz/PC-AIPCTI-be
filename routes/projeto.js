const express = require("express");
const router = express.Router();

const connection = require("../db");

const { query, body, validationResult } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(query("cpfUsuario").isLength({ min: 11, max: 11 }), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    connection.query(
      "SELECT * FROM projeto WHERE cpfUsuario=?",
      [req.query.cpfUsuario],
      (error, results, fields) => {
        if (error) {
          return res.sendStatus(500);
        }
        res.json({
          user: req.user,
          token: req.token,
          results: results,
        });
      }
    );
  })
  .post(
    body("cpfUsuario").isLength({ min: 11, max: 11 }),
    body("projetos").exists(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      const cpfUsuario = req.body.cpfUsuario;
      const projetos = req.body.projetos;

      let query =
        "INSERT INTO projeto (cpfUsuario, nome, valorRecebidoTotal, valorRecebidoCapital, valorRecebidoCusteio, idEdital) VALUES";

      let error = false;
      projetos.forEach((projeto) => {
        if (
          !projeto.nome ||
          isNaN(projeto.valorRecebidoTotal) ||
          isNaN(projeto.valorRecebidoCapital) ||
          isNaN(projeto.valorRecebidoCusteio) ||
          isNaN(projeto.idEdital)
        ) {
          error = true;
          return res.sendStatus(400);
        }
        query += `('${cpfUsuario}', '${projeto.nome}', ${projeto.valorRecebidoTotal}, ${projeto.valorRecebidoCapital}, ${projeto.valorRecebidoCusteio}, ${projeto.idEdital}),`;
      });
      if (error) return;
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
    body("cpfUsuario").isLength({ min: 11, max: 11 }),
    body("id").isNumeric(),
    body("projetoNewInfo.nome").exists(),
    body("projetoNewInfo.valorRecebidoTotal").isNumeric(),
    body("projetoNewInfo.valorRecebidoCusteio").isNumeric(),
    body("projetoNewInfo.valorRecebidoCapital").isNumeric(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      connection.query(
        "UPDATE projeto SET nome=?, valorRecebidoTotal=?, valorRecebidoCapital=?, valorRecebidoCusteio=?, idEdital=? WHERE cpfUsuario=? AND id=?",
        [
          req.body.projetoNewInfo.nome,
          req.body.projetoNewInfo.valorRecebidoTotal,
          req.body.projetoNewInfo.valorRecebidoCapital,
          req.body.projetoNewInfo.valorRecebidoCusteio,
          req.body.projetoNewInfo.idEdital,
          req.body.cpfUsuario,
          req.body.id,
        ],
        (error, results, fields) => {
          if (error) {
            return sendStatus(500);
          }

          res.status(200).json({ user: req.user, token: req.token });
        }
      );
    }
  )
  .delete(body("id").isNumeric(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    connection.query(
      "DELETE FROM projeto WHERE id = ?",
      [req.body.id],
      (error) => {
        if (error) return res.sendStatus(500);

        res.status(200).json({ token: req.token, user: req.user });
      }
    );
  });

module.exports = router;

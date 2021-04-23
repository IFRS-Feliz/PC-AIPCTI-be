const express = require("express");
const router = express.Router();

const connection = require("../db");

const { body, validationResult } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get((req, res) => {
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
  })
  .delete(body("id").isInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    connection.query(
      "DELETE FROM edital WHERE id=?",
      [req.body.id],
      (error, results) => {
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
    body("nome").exists(),
    body("dataInicio").isDate(),
    body("dataFim").isDate(),
    body("valorIPCT").isInt(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      connection.query(
        "INSERT INTO edital (nome, dataInicio, dataFim, valorIPCT, ano) VALUES(?,?,?,?,?)",
        [
          req.body.nome,
          req.body.dataInicio,
          req.body.dataFim,
          req.body.valorIPCT,
          req.body.ano,
        ],
        (error, results) => {
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
    }
  );

module.exports = router;

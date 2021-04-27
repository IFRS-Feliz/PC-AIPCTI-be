const express = require("express");
const router = express.Router();

const connection = require("../db");

const { body, query, validationResult } = require("express-validator");

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get(query("id").isInt().optional(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    if (req.query.id) {
      connection.query(
        "SELECT * FROM edital WHERE id=?",
        [req.query.id],
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
    }
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
    body("dataLimitePrestacao").isDate(),
    body("valorAIPCTI").isInt(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }

      connection.query(
        "INSERT INTO edital (nome, dataInicio, dataFim, valorAIPCTI, ano, dataLimitePrestacao) VALUES(?,?,?,?,?,?)",
        [
          req.body.nome,
          req.body.dataInicio,
          req.body.dataFim,
          req.body.valorAIPCTI,
          req.body.ano,
          req.body.dataLimitePrestacao,
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
  )
  .put(
    body("id").isInt(),
    body("nome").exists(),
    body("dataInicio").isDate(),
    body("dataFim").isDate(),
    body("dataLimitePrestacao").isDate(),
    body("valorAIPCTI").isInt(),
    body("ano").isLength({ min: 4, max: 4 }).isInt(),
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return res.sendStatus(400);
      }
      //atualizar o edital
      connection.query(
        "UPDATE edital SET nome = ?, dataInicio = ?, dataFim = ?, valorAIPCTI = ?, ano = ?, dataLimitePrestacao = ? WHERE id = ? ",
        [
          req.body.nome,
          req.body.dataInicio,
          req.body.dataFim,
          req.body.valorAIPCTI,
          req.body.ano,
          req.body.dataLimitePrestacao,
          req.body.id,
        ],
        (error, results) => {
          if (error) return res.sendStatus(500);

          res
            .status(200)
            .json({ user: req.user, token: req.token, results: results });
        }
      );
    }
  );

module.exports = router;

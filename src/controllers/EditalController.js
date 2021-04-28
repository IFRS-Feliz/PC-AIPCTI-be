const { validationResult } = require("express-validator");
const connection = require("../services/db");

module.exports = {
  get: (req, res) => {
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
  },
  post: (req, res) => {
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
  },
  put: (req, res) => {
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
  },
  del: (req, res) => {
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
  },
};

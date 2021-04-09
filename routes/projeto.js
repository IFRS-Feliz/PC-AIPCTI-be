const express = require("express");
const router = express.Router();

const connection = require("../db").connection;

router
  .route("/")
  .get((req, res) => {
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        if (req.query.cpfUsuario) {
          connection.query(
            "SELECT * FROM projeto WHERE cpfUsuario=?",
            [req.query.cpfUsuario],
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
        }
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
  })
  .put((req, res) => {
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        if (req.body.cpfUsuario && req.body.id) {
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
                throw error;
              }
              res.status(200).send();
            }
          );
        }
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

module.exports = router;

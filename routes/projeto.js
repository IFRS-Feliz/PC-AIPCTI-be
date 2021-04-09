const express = require("express");
const router = express.Router();

const connection = require("../db").connection;

//setup authorization middleware
const authorization = require("../middleware").auth;
router.use(authorization(true));

router
  .route("/")
  .get((req, res) => {
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
  })
  .put((req, res) => {
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
  });

module.exports = router;

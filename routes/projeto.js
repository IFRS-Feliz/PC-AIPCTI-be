const express = require("express");
const router = express.Router();

const connection = require("../db");

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
            user: req.user,
            token: req.token,
            results: results,
          });
        }
      );
    }
  })
  .post((req, res) => {
    const cpfUsuario = req.body.cpfUsuario;
    const projetos = req.body.projetos;
    let query =
      "INSERT INTO projeto (cpfUsuario, nome, valorRecebidoTotal, valorRecebidoCapital, valorRecebidoCusteio, idEdital) VALUES";
    projetos.forEach((projeto) => {
      query += `('${cpfUsuario}', '${projeto.nome}', ${projeto.valorRecebidoTotal}, ${projeto.valorRecebidoCapital}, ${projeto.valorRecebidoCusteio}, ${projeto.idEdital}),`;
    });
    query = query.substring(0, query.length - 1) + ";";

    connection.query(
      query,
      [req.body.cpf, req.body.nome, req.body.email, 123, req.body.isAdmin],
      (error, results, fields) => {
        if (error) {
          throw error;
        }

        res.status(200).json({ user: req.user, token: req.token });
      }
    );
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

          res.status(200).json({ user: req.user, token: req.token });
        }
      );
    }
  });

module.exports = router;

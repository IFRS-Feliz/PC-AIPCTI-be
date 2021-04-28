const { validationResult } = require("express-validator");
const connection = require("../services/db");

module.exports = {
  get: (req, res) => {
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
    } else if (req.query.idEdital) {
      connection.query(
        "SELECT * FROM projeto WHERE idEdital=?",
        [req.query.idEdital],
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
  },
  post: (req, res) => {
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

        res
          .status(200)
          .json({ user: req.user, token: req.token, results: results });
      }
    );
  },
  put: (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    let query =
      "INSERT INTO projeto (id, nome, valorRecebidoTotal, valorRecebidoCapital, valorRecebidoCusteio, idEdital, cpfUsuario) VALUES";

    req.body.projetos.forEach((projeto) => {
      query += `(${projeto.id}, "${projeto.nome}", ${projeto.valorRecebidoTotal}, ${projeto.valorRecebidoCapital}, ${projeto.valorRecebidoCusteio}, ${projeto.idEdital}, "${projeto.cpfUsuario}"),`;
    });
    query = query.substring(0, query.length - 1);

    query +=
      " ON DUPLICATE KEY UPDATE nome=VALUES(nome), valorRecebidoTotal=VALUES(valorRecebidoTotal), valorRecebidoCapital=VALUES(valorRecebidoCapital), valorRecebidoCusteio=VALUES(valorRecebidoCusteio), idEdital=VALUES(idEdital), cpfUsuario=VALUES(cpfUsuario);";

    connection.query(query, (error, results, fields) => {
      if (error) {
        return res.sendStatus(500);
      }

      res.status(200).json({ user: req.user, token: req.token });
    });
  },
  del: (req, res) => {
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
  },
};

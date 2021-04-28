const { validationResult } = require("express-validator");
const connection = require("../services/db");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const transporter = require("../services/mail");

module.exports = {
  get: (req, res) => {
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
  },
  post: (req, res) => {
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

            const randomPassword = crypto
              .randomBytes(2)
              .toString("hex")
              .toUpperCase(); //gerar uma senha aleatoria com 8 caracteres
            // console.log(randomPassword);
            const hash = bcrypt.hashSync(randomPassword, 10);

            //inserir o usuario
            connection.query(
              "INSERT INTO usuario (cpf, nome, email, senha, isAdmin) VALUES (?, ?, ?, ?, ?)",
              [
                req.body.cpf,
                req.body.nome,
                req.body.email,
                hash,
                0, //nunca será admin
              ],
              (error) => {
                if (error) return res.sendStatus(500);

                transporter
                  .sendMail({
                    html: `<p>Senha: ${randomPassword}</p>`,
                    to: req.body.email,
                  })
                  .then(
                    res.status(200).json({ user: req.user, token: req.token })
                  )
                  .catch((e) => {
                    console.log(e);
                  });
              }
            );
          }
        );
      }
    );
  },
  put: (req, res) => {
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
  },
  del: (req, res) => {
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
  },
};

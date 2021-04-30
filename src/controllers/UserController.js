const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../services/mail");
const User = require("../services/db").models.User;
const { Op } = require("sequelize");

module.exports = {
  get: async (req, res) => {
    const usuarios = res.results;

    res.json({
      user: req.user,
      token: req.token,
      results: usuarios,
      previous: res.previousPage,
      next: res.nextPage,
    });
  },
  getSingle: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const usuarios = await User.findByPk(req.params.cpf, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [usuarios],
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const duplicates = await User.findAll({
      where: { [Op.or]: [{ cpf: req.body.cpf }, { email: req.body.email }] },
    });

    if (duplicates.length > 0)
      return res.status(400).send("Usuario já existe.");

    //gerar uma senha aleatoria com 4 caracteres
    const randomPassword = crypto.randomBytes(2).toString("hex").toUpperCase();
    const hash = await bcrypt.hash(randomPassword, 10);

    const results = await User.create({
      cpf: req.body.cpf,
      nome: req.body.nome,
      email: req.body.email,
      senha: hash,
      isAdmin: false,
    });

    if (!results) return res.sendStatus(500);

    const email = await transporter.sendMail({
      html: `<p>Senha: ${randomPassword}</p>`,
      to: req.body.email,
    });

    if (!email) res.sendStatus(500);

    res.status(200).json({ user: req.user, token: req.token });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const duplicates = await User.findAll({
      where: {
        [Op.and]: [
          { email: req.body.email },
          { [Op.not]: { cpf: req.body.cpf } },
        ],
      },
    });

    if (duplicates.length > 0)
      return res.status(400).send("Email em uso por outro usuario.");

    const results = await User.update(
      {
        nome: req.body.nome,
        email: req.body.email,
      },
      { where: { cpf: req.body.cpf } }
    );

    if (!results) return res.sendStatus(500);

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await User.destroy({ where: { cpf: req.body.cpf } });

    if (!results) res.sendStatus(500);

    res
      .status(200)
      .send({ token: req.token, user: req.user, results: results });
  },
};

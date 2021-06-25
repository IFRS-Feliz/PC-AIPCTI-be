const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  sendCreateUserMail,
  sendPasswordResetMail,
} = require("../services/mail");
const sequelize = require("../services/db");
const User = sequelize.models.User;
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
    const usuarios = await User.findByPk(req.params.cpf, {
      raw: true,
      attributes: {
        exclude: ["senha"],
      },
    });

    return res.json({
      user: req.user,
      token: req.token,
      results: [usuarios],
    });
  },
  post: async (req, res) => {
    const duplicates = await User.findAll({
      where: { [Op.or]: [{ cpf: req.body.cpf }, { email: req.body.email }] },
    });

    if (duplicates.length > 0)
      return res.status(400).send("Usuario já existe.");

    //gerar uma senha aleatoria com 4 caracteres
    const { randomPassword, hash } = await generateRandomPasswordAndHash();

    const results = await User.create({
      cpf: req.body.cpf,
      nome: req.body.nome,
      email: req.body.email,
      senha: hash,
      isAdmin: false,
    });

    if (!results) return res.sendStatus(500);

    const mail = await sendCreateUserMail(req.body.email, randomPassword);

    if (!mail) res.sendStatus(500);

    res.status(200).json({ user: req.user, token: req.token });
  },
  put: async (req, res) => {
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
    const results = await User.destroy({ where: { cpf: req.body.cpf } });

    if (!results) res.sendStatus(500);

    res
      .status(200)
      .send({ token: req.token, user: req.user, results: results });
  },
  changePassword: async (req, res) => {
    let password = req.body.password;
    const cpf = req.params.cpf;

    //caso o admin esteja resetando o senha
    if (!password) {
      //gerar uma senha aleatoria com 4 caracteres e salvar
      const { randomPassword, hash } = await generateRandomPasswordAndHash();
      const email = await updateUserPasswordAndGetEmail(cpf, hash);

      //enviar email para o usuario e finalizar
      await sendPasswordResetMail(email, randomPassword, true);
      res.json({ token: req.token, user: req.user });
      return;
    }

    //caso o usuario esteja alterando a senha
    //encriptar e salvar senha
    const hash = await generatePasswordHash(password);
    const email = await updateUserPasswordAndGetEmail(cpf, hash);

    //enviar email para o usuario e finalizar
    await sendPasswordResetMail(email, password);
    res.json({ token: req.token, user: req.user });

    async function updateUserPasswordAndGetEmail(cpf, hash) {
      const user = await User.findByPk(cpf);
      await user.update({ senha: hash }, { fields: ["senha"] });
      return user.getDataValue("email");
    }
  },
};

async function generateRandomPasswordAndHash() {
  const randomPassword = crypto.randomBytes(2).toString("hex").toUpperCase();
  const hash = await generatePasswordHash(randomPassword);
  return { randomPassword, hash };
}

async function generatePasswordHash(password) {
  return await bcrypt.hash(password, 10);
}

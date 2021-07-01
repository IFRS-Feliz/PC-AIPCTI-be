const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

function auth(adminOnly) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"]; //Bearer token
    let token = authHeader && authHeader.split(" ")[1]; //token

    const refreshToken = req.cookies.refreshToken;
    let user;

    try {
      user = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      //caso o token jwt nao seja invalido

      //caso nao haja um refresh token o usuario nao esta logado
      if (!refreshToken) return res.sendStatus(401);

      //verificar o refresh token
      try {
        user = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        //criar uma nova token para o usuario caso o refresh token seja valido
        const newUser = {
          name: user.name,
          cpf: user.cpf,
          email: user.email,
          isAdmin: user.isAdmin,
        };

        token = jwt.sign(newUser, process.env.SECRET, {
          expiresIn: "100m",
        });
      } catch (error) {
        //caso o refresh token seja invalido o usuario nao esta logado
        return res.sendStatus(401);
      }
    }

    //caso a rota especifique que é adminOnly, verificar
    if (user.isAdmin === 0 && adminOnly) return res.sendStatus(403);

    //setar variaveis para que os proximos middlewares possam usar
    req.token = token;
    req.user = user;

    next();
  };
}

function paginatedResults(model, where = {}) {
  return async (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const offset = (page - 1) * limit;

    const sortBy = req.query.sortBy; // id, nome, cpf etc..
    const order = req.query.order; //ASC | DESC

    //adicionar wheres do Projeto se for o caso
    if (req.query.cpfUsuario) where.cpfUsuario = req.query.cpfUsuario;
    else delete where.cpfUsuario; //deletando porque, por algum motivo, haviam valores no where mesmo quando nenhum parametro é passado
    if (req.query.idEdital) where.idEdital = req.query.idEdital;
    else delete where.idEdital;

    //adicionar wheres do Item se for o caso
    if (req.query.idProjeto) where.idProjeto = req.query.idProjeto;
    else delete where.idProjeto;

    //adicionar wheres do Orcamento e Justificativa se for o caso
    if (req.query.idItem) where.idItem = req.query.idItem;
    else delete where.idItem;

    //fetch do db
    let results = [];
    if (!limit || !page) {
      results = await model.findAll({
        raw: true,
        where: where,
        attributes: {
          exclude: ["senha"],
        },
        order: order && sortBy ? [[sortBy, order]] : undefined,
      });
    } else {
      results = await model.findAll({
        raw: true,
        where: where,
        limit: limit,
        offset: offset,
        attributes: {
          exclude: ["senha"],
        },
        order: order && sortBy ? [[sortBy, order]] : undefined,
      });
    }

    res.results = results;

    //setar informacoes sobre a pagina anterior
    if (offset > 0) res.previousPage = { page: page - 1, limit: limit };

    //setar informacoes sobre as paginas seguintes
    let countUsers = await model.findAndCountAll({ raw: true, where: where });
    countUsers = countUsers.count;
    if (page * limit < countUsers) {
      res.nextPage = {
        page: page + 1,
        limit: limit,
        nextPagesCount: Math.ceil(countUsers / limit - page),
      };
    }

    next();
  };
}

const { query } = require("express-validator");
const validatorsPaginatedResults = [
  query("limit").isInt().optional(),
  query("page").isInt().optional(),
];

function numberSanitizer(value) {
  value = Number(value);
  return isNaN(value) ? 0 : value;
}

function intSanitizer(value) {
  value = parseInt(value);
  return isNaN(value) ? 0 : value;
}

function dataSanitizer(value) {
  return value === "0000-00-00" ? null : value;
}

function getAnexoFileName(file) {
  let ext = path.extname(file.originalname);
  if (ext === ".jpeg") ext = ".jpg";
  const uuid = uuidv4();
  return { uuid, ext };
}

module.exports = {
  auth,
  paginatedResults,
  validatorsPaginatedResults,
  numberSanitizer,
  dataSanitizer,
  intSanitizer,
  getAnexoFileName,
};

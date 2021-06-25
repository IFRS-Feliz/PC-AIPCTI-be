const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

function auth(adminOnly) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"]; //Bearer token
    let token = authHeader && authHeader.split(" ")[1]; //token

    const refreshToken = req.cookies.refreshToken;

    jwt.verify(token, process.env.SECRET, (error, user) => {
      if (error) {
        if (refreshToken) {
          //futuramente verificar se refreshToken esta no db
          jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET,
            (errorR, userR) => {
              if (errorR) return res.sendStatus(401);

              const newUser = {
                name: userR.name,
                cpf: userR.cpf,
                email: userR.email,
                isAdmin: userR.isAdmin,
              };

              token = jwt.sign(newUser, process.env.SECRET, {
                expiresIn: "100m",
              });

              user = userR;
            }
          );
        } else return res.sendStatus(401);
      }

      if (user.isAdmin === 0 && adminOnly) return res.sendStatus(403);

      req.token = token;
      req.user = user;
      next();
    });
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

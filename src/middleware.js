const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

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
                expiresIn: "10m",
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

    //adicionar wheres do Projeto caso seja o caso
    if (req.query.cpfUsuario) where.cpfUsuario = req.query.cpfUsuario;
    if (req.query.idEdital) where.idEdital = req.query.idEdital;

    //fech do db
    let results = [];
    if (!limit || !page) {
      results = await model.findAll({
        raw: true,
        where: where,
      });
    } else {
      results = await model.findAll({
        raw: true,
        where: where,
        limit: limit,
        offset: offset,
      });
    }

    res.results = results;

    if (offset > 0) {
      //setar informacoes sobre a pagina anterior
      res.previousPage = { page: page - 1, limit: limit };
    }

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

module.exports = { auth, paginatedResults };

const { validationResult } = require("express-validator");

class BadRequestError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Requisição inválida";
    this.status = 400;
  }
}

class InternalServerError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Erro interno no servidor";
    this.status = 500;
  }
}

const errorHandler = (err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.name, message: err.message });
};

const checkValidations = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new BadRequestError("verificar");
  }
  next();
};

module.exports = {
  errorHandler,
  BadRequestError,
  InternalServerError,
  checkValidations,
};

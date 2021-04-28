const { validationResult } = require("express-validator");
const Edital = require("../services/db").models.Edital;

module.exports = {
  get: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    if (req.query.id) {
      const edital = await Edital.findByPk(req.query.id, { raw: true });

      return res.json({
        user: req.user,
        token: req.token,
        results: [edital],
      });
    }

    //caso um id de edital nao tenha sido especificado
    const editais = await Edital.findAll({ raw: true });

    res.json({
      user: req.user,
      token: req.token,
      results: editais,
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Edital.create({
      nome: req.body.nome,
      dataInicio: req.body.dataInicio,
      dataFim: req.body.dataFim,
      valorAIPCTI: req.body.valorAIPCTI,
      ano: req.body.ano,
      dataLimitePrestacao: req.body.dataLimitePrestacao,
    });

    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Edital.update(
      {
        nome: req.body.nome,
        dataInicio: req.body.dataInicio,
        dataFim: req.body.dataFim,
        valorAIPCTI: req.body.valorAIPCTI,
        ano: req.body.ano,
        dataLimitePrestacao: req.body.dataLimitePrestacao,
      },
      { where: { id: req.body.id } }
    );

    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  },
  del: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Edital.destroy({ where: { id: req.body.id } });

    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  },
};

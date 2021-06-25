const Edital = require("../services/db").models.Edital;

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
    const editais = await Edital.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [editais],
    });
  },
  post: async (req, res) => {
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
    const results = await Edital.destroy({ where: { id: req.body.id } });

    res.json({
      user: req.user,
      token: req.token,
      results: results,
    });
  },
};

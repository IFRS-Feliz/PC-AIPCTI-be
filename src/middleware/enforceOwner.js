const sequelize = require("../db");
const Projeto = sequelize.models.Projeto;
const Item = sequelize.models.Item;
const Orcamento = sequelize.models.Orcamento;
const Justificativa = sequelize.models.Justificativa;

//middlewares para verificar se o usuario possui o recurso que esta tentando
//modificar ou alterar

//basicamente olham o id do recurso e vai fazendo queries
//no banco ate encontrar o cpfUsuario do dono e entao
//compara com o cpf do usuario fazendo o request

//caso o usuario seja admin as verificacoes serao puladas

function enforceOwnerByCpfParam(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  const cpfResource = req.params.cpf;

  if (cpfRequest !== cpfResource) return res.sendStatus(403);
  next();
}

async function enforceOwnerByProjetoIdParam(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  const idProjeto = req.params.id;

  const projeto = await Projeto.findByPk(idProjeto, {
    attributes: ["cpfUsuario"],
  });
  if (!projeto) return res.sendStatus(400);

  const cpfResource = projeto.cpfUsuario;
  if (cpfRequest !== cpfResource) return res.sendStatus(403);

  next();
}

async function enforceOwnerByItemIdParam(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  const idItem = req.params.id;

  const item = await Item.findByPk(idItem, { include: Projeto, raw: true });
  if (!item) return res.sendStatus(400);

  const cpfResource = item["Projeto.cpfUsuario"];
  if (cpfRequest !== cpfResource) return res.sendStatus(403);

  next();
}

async function enforceOwnerByProjetoIdBody(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  const itens = req.body.itens;

  let idsProjetos = [];
  for (let i = 0; i < itens.length; i++) {
    const idProjeto = itens[i].idProjeto;

    if (!idsProjetos.includes(idProjeto)) {
      idsProjetos.push(idProjeto);
    }
  }

  const projetos = await Projeto.findAll({
    where: { id: idsProjetos },
    raw: true,
  });
  if (!projetos) return res.sendStatus(400);

  for (let i = 0; i < projetos.length; i++) {
    const cpfResource = projetos[i].cpfUsuario;

    if (cpfResource !== cpfRequest) {
      return res.sendStatus(403);
    }
  }

  next();
}

async function enforceOwnerByItemIdBody(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  let itens = req.body.itens;

  if (!itens) {
    let orcamentos = req.body.orcamentos;
    if (!orcamentos) {
      let idItem = req.body.idItem;

      const item = await Item.findByPk(idItem, { include: Projeto, raw: true });
      if (!item) return res.sendStatus(400);

      const cpfResource = item["Projeto.cpfUsuario"];
      if (cpfResource !== cpfRequest) return res.sendStatus(403);

      return next();
    }
    let idsItens = [];
    for (let i = 0; i < orcamentos.length; i++) {
      const idItem = orcamentos[i].idItem;

      if (!idsItens.includes(idItem)) {
        idsItens.push(idItem);
      }
    }

    await verifyAndFinish(idsItens);

    return;
  }

  let idsItens = [];
  for (let i = 0; i < itens.length; i++) {
    const idItem = itens[i].id;

    if (!idsItens.includes(idItem)) {
      idsItens.push(idItem);
    }
  }

  await verifyAndFinish(idsItens);

  async function verifyAndFinish(idsItens) {
    let itens = await Item.findAll({
      where: { id: idsItens },
      include: Projeto,
      raw: true,
    });
    if (!itens) return res.sendStatus(400);

    for (let i = 0; i < itens.length; i++) {
      const cpfResource = itens[i]["Projeto.cpfUsuario"];
      if (cpfResource !== cpfRequest) {
        return res.sendStatus(403);
      }
    }

    next();
  }
}

function enforceOwnerByOrcamentoOrJustificativaParam(tipo) {
  let Model = Orcamento;
  if (tipo === "justificativa") {
    Model = Justificativa;
  }

  return async (req, res, next) => {
    const isAdmin = req.user.isAdmin;
    if (isAdmin) return next();

    const cpfRequest = req.user.cpf;
    const idOrcamentoJustificativa = req.params.id;

    const orcamentoJustificativa = await Model.findByPk(
      idOrcamentoJustificativa,
      {
        include: [
          {
            model: Item,
            include: [Projeto],
          },
        ],
        raw: true,
      }
    );
    if (!orcamentoJustificativa) return res.sendStatus(400);

    const cpfResource = orcamentoJustificativa["Item.Projeto.cpfUsuario"];

    if (cpfResource !== cpfRequest) return res.sendStatus(403);

    next();
  };
}

async function enforceOwnerByOrcamentoIdBody(req, res, next) {
  const isAdmin = req.user.isAdmin;
  if (isAdmin) return next();

  const cpfRequest = req.user.cpf;
  let orcamentos = req.body.orcamentos;

  let idsOrcamentos = [];
  for (let i = 0; i < orcamentos.length; i++) {
    const idOrcamento = orcamentos[i].id;

    if (!idsOrcamentos.includes(idOrcamento)) {
      idsOrcamentos.push(idOrcamento);
    }
  }

  orcamentos = await Orcamento.findAll({
    where: { id: idsOrcamentos },
    include: [
      {
        model: Item,
        include: [Projeto],
      },
    ],
    raw: true,
  });

  if (!orcamentos) return res.sendStatus(400);

  for (let i = 0; i < orcamentos.length; i++) {
    const cpfResource = orcamentos[i]["Item.Projeto.cpfUsuario"];
    if (cpfResource !== cpfRequest) {
      return res.sendStatus(403);
    }
  }

  next();
}

module.exports = {
  enforceOwnerByCpfParam,
  enforceOwnerByProjetoIdParam,
  enforceOwnerByItemIdParam,
  enforceOwnerByProjetoIdBody,
  enforceOwnerByItemIdBody,
  enforceOwnerByOrcamentoOrJustificativaParam,
  enforceOwnerByOrcamentoIdBody,
};

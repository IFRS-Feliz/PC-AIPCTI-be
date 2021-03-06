const sequelize = require("../db");
const Projeto = sequelize.models.Projeto;
const Item = sequelize.models.Item;
const Orcamento = sequelize.models.Orcamento;
const Justificativa = sequelize.models.Justificativa;
const Edital = sequelize.models.Edital;
const Gru = sequelize.models.Gru;
const AdmZip = require("adm-zip");
const moment = require("moment");

const fs = require("fs");

const fonts = {
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Symbol: {
    normal: "Symbol",
  },
  ZapfDingbats: {
    normal: "ZapfDingbats",
  },
};

const PdfPrinter = require("pdfmake");
const { Stream, Readable } = require("stream");
const printer = new PdfPrinter(fonts);

module.exports = {
  get: async (req, res) => {
    const projetos = res.results;

    res.json({
      user: req.user,
      token: req.token,
      results: projetos,
      previous: res.previousPage,
      next: res.nextPage,
    });
  },
  getSingle: async (req, res) => {
    const projetos = await Projeto.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [projetos],
    });
  },
  post: async (req, res) => {
    const results = await Projeto.bulkCreate(req.body.projetos);

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    const results = await Projeto.bulkCreate(req.body.projetos, {
      updateOnDuplicate: [
        "cpfUsuario",
        "nome",
        "valorRecebidoTotal",
        "valorRecebidoCapital",
        "valorRecebidoCusteio",
        "idEdital",
      ],
    });

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  del: async (req, res) => {
    const ids = req.body.projetos.map((projeto) => projeto.id);

    const results = await Projeto.destroy({ where: { id: ids } });

    res
      .status(200)
      .json({ token: req.token, user: req.user, results: results });
  },

  getRelatorio: async (req, res) => {
    const zip = new AdmZip();

    const projeto = await Projeto.findAll({
      raw: true,
      where: { id: req.params.id },
    });

    const gru = await Gru.findAll({
      raw: true,
      where: { idProjeto: projeto[0].id },
    });

    const edital = await Edital.findAll({
      raw: true,
      where: { id: projeto[0].idEdital },
    });

    // verificar se a data limite ?? maior do que data do documento fiscal/or??amento
    function verificarDataLimite(dataEdital, dataInicial) {
      if (!moment(dataInicial).isAfter(dataEdital)) {
        return true;
      }
      return false;
    }

    const itens = await Item.findAll({
      raw: true,
      where: { idProjeto: req.params.id },
    });

    itens.sort((a, b) => {
      if (a.posicao > b.posicao) return 1;
      else if (a.posicao < b.posicao) return -1;
      else return 0;
    });

    function valorTotalUtilizado() {
      let soma = 0;
      itens.forEach((value) => {
        soma += Number(value.valorTotal);
      });

      return soma.toFixed(2);
    }

    let docDefinition = {
      pageSize: "A4",
      pageMargins: [20, 150, 20, 40],
      header: function (currentPage) {
        return [
          currentPage === 1 ? { text: ".", fontSize: 1, id: "home" } : {},
          {
            image: `${__dirname}/../assets/brasao.jpg`,
            alignment: "center",
            width: 30,
            margin: [0, 10, 0, 0],
          },
          {
            text: `
          Minist??rio da Educa????o\n
          Secretaria de Educa????o Profissional e Tecnol??gica\n
          Instituto Federal de Educa????o, Ci??ncia e Tecnologia do Rio Grande do Sul\n
          Pr??-reitoria de Pesquisa, P??s-gradua????o e Inova????o / Pr??-reitoria de Extens??o/ Pr??-reitoria de Ensino /Pr??-reitoria de Administra????o\n
           Rua Gen. Os??rio, 348 ??? Centro ??? Bento Gon??alves/RS ??? CEP 95.700-086\n
          Telefone: (54) 3449.3300 ??? www.ifrs.edu.br ???\n
          E-mail: proppi@ifrs.edu.br/ proex@ifrs.edu.br/ proen@ifrs.edu.br/ proad@ifrs.edu.br\n
          `,
            fontSize: 7,
            alignment: "center",
            lineHeight: 0.7,
            margin: [0, 5, 0, 10],
          },
        ];
      },
      footer: {
        text: "in??cio",
        alignment: "center",
        linkToDestination: "home",
        margin: [0, 20, 0, 0],
      },

      content: [
        {
          text: `Relat??rio: ${projeto[0].nome}`,
          alignment: "center",
          margin: [0, 0, 0, 15],
          fontSize: 15,
        },
        {
          table: {
            style: "table",
            widths: [200, "*"],

            body: [
              [
                { text: "T??tulo do programa ou projeto", style: "tituloTable" },
                { text: projeto[0].nome, style: "celulaTable" },
              ],
              [
                { text: "Nome do coordenador", style: "tituloTable" },
                { text: req.user.name, style: "celulaTable" },
              ],
              [
                { text: "CPF do coordenador", style: "tituloTable" },
                {
                  text: req.user.cpf.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                    "$1.$2.$3-$4"
                  ),
                  style: "celulaTable",
                },
              ],
              [
                {
                  text: "N??mero do edital que concedeu recurso",
                  style: "tituloTable",
                },
                { text: edital[0].nome, style: "celulaTable" },
              ],
              [
                { text: "Campus", style: "tituloTable" },
                { text: "Feliz", style: "celulaTable" },
              ],
              [
                { text: "Valor total recebido", style: "tituloTable" },
                {
                  text: `R$ ${projeto[0].valorRecebidoTotal}`,
                  style: "celulaTable",
                },
              ],
              [
                { text: "Valor total utilizado", style: "tituloTable" },
                { text: `R$ ${valorTotalUtilizado()}`, style: "celulaTable" },
              ],
              [
                gru.length > 0
                  ? {
                      text: "Valor total devolvido (GRU)",
                      style: "tituloTable",
                      linkToDestination: "gru",
                      color: "blue",
                    }
                  : {
                      text: "Valor total devolvido (GRU)",
                      style: "tituloTable",
                    },
                gru.length > 0
                  ? {
                      text: `R$ ${(
                        Number(gru[0].valorTotalCapital) +
                        Number(gru[0].valorTotalCusteio)
                      ).toFixed(2)}`,
                      style: "celulaTable",
                    }
                  : { text: "N??o h?? Gru", style: "celulaTable" },
              ],
            ],
          },
          layout: {
            vLineWidth: () => 0.2,
            hLineWidth: () => 0.2,
          },
        },
      ],
      defaultStyle: {
        font: "Helvetica",
      },
      styles: {
        table: {
          margin: [0, 0, 0, 20],
        },
        tituloTable: {
          bold: true,
          margin: [2, 0],
          fontSize: 9,
        },
        celulaTable: {
          margin: [2, 0],
          fontSize: 9,
        },
        marginText: {
          margin: [0, 0, 0, 3],
        },
        lista: {
          margin: [30, 20, 0, 20],
          fontSize: 10,
        },
        link: {
          color: "blue",
        },
        tableHeader: {
          bold: true,
          alignment: "center",
          fontSize: 7,
        },
        celulaTabelaGeral: {
          fontSize: 6,
          bold: false,
          alignment: "center",
        },
      },
    };

    let separacao = {
      text: ".",
      fontSize: 1,
      margin: [0, 10],
    };

    let quebrarPagina = {
      text: ".",
      pageBreak: "after",
      fontSize: 1,
    };
    // Tabela com todas as informacoes dos documentos fiscais

    let tabelaGeral = {
      table: {
        widths: [20, "*", 60, 40, 55, 75, 35, 30, 35, 40],
        headerRows: 1,
        body: [
          [
            { text: "N?? do item", style: "tableHeader" },
            { text: "Nome do item", style: "tableHeader" },
            { text: "Tipo", style: "tableHeader" },
            { text: "Data", style: "tableHeader" },
            { text: "Favorecido", style: "tableHeader" },
            { text: "N?? do documento fiscal", style: "tableHeader" },
            { text: "Valor unit??rio", style: "tableHeader" },
            { text: "Quant.", style: "tableHeader" },
            { text: "Frete", style: "tableHeader" },
            { text: "Valor Total", style: "tableHeader" },
          ],
        ],
      },
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return rowIndex % 2 === 0 ? "#ececec" : null;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 0.2 : 0;
        },
        hLineWidth: () => 0.2,
      },
    };

    // Variavel que contem o valor total da soma de todos os itens

    itens.forEach((value, index) => {
      // verifica se tem um anexo
      if (value.pathAnexo) {
        let anexoItem = `${process.cwd()}/uploads/${value.pathAnexo}`;
        zip.addLocalFile(anexoItem, "Relatorio/pdfs");
      }

      // switch dos tipos dos itens para inserir na tabela
      switch (value.tipo) {
        case "materialPermanente":
          value.tipo = "Material permanente";
          break;
        case "materialConsumo":
          value.tipo = "Material de consumo";
          break;
        case "servicoPessoaFisica":
          value.tipo = "Servi??os de terceiros (pessoa f??sica)";
          break;
        case "servicoPessoaJuridica":
          value.tipo = "Servi??os de terceiros (pessoa jur??dica)";
          break;
        case "hospedagem":
          value.tipo = "Hospedagem";
          break;
        case "passagem":
          value.tipo = "Passagem";
          break;
        case "alimentacao":
          value.tipo = "Alimenta????o";
          break;
        default:
          break;
      }

      let data;
      if (
        value.dataCompraContratacao !== null &&
        value.dataCompraContratacao !== "0000-00-00"
      )
        data = value.dataCompraContratacao.split("-");

      tabelaGeral.table.body.push([
        {
          text: index + 1,
          style: ["celulaTabelaGeral", "link"],
          linkToDestination: `item${index + 1}`,
          decoration: "underline",
          fontSize: 7,
        },
        {
          text: [
            value.nomeMaterialServico !== null &&
            value.nomeMaterialServico.length !== 0
              ? { text: value.nomeMaterialServico }
              : { text: "Nome n??o informado" },
            {
              text: "\nver detalhamento",
              style: ["link"],
              linkToDestination: `descricao${index + 1}`,
            },
          ],
          style: "celulaTabelaGeral",
        },
        {
          text: value.tipo,
          style: "celulaTabelaGeral",
        },
        data !== undefined
          ? {
              text: `${data[2]}/${data[1]}/${data[0]}`,
              style: "celulaTabelaGeral",
            }
          : { text: "Data n??o informada", style: "celulaTabelaGeral" },
        value.cnpjFavorecido !== null && value.cnpjFavorecido.length !== 0
          ? {
              text: value.cnpjFavorecido.replace(
                /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
                "$1.$2.$3/$4-$5"
              ),
              style: "celulaTabelaGeral",
            }
          : { text: "CNPJ n??o informado", style: "celulaTabelaGeral" },
        value.numeroDocumentoFiscal !== null &&
        value.numeroDocumentoFiscal.length !== 0
          ? {
              text: value.numeroDocumentoFiscal,
              style: "celulaTabelaGeral",
            }
          : {
              text: "N??mero documento fiscal n??o informado",
              style: "celulaTabelaGeral",
            },
        {
          text: `R$ ${value.valorUnitario}`,
          style: "celulaTabelaGeral",
        },
        {
          text: value.quantidade,
          style: "celulaTabelaGeral",
        },
        {
          text: `R$ ${value.frete}`,
          style: "celulaTabelaGeral",
        },
        {
          text: `R$ ${value.valorTotal}`,
          style: "celulaTabelaGeral",
        },
      ]);
    });

    // Valor total de todos os itens do projeto
    let totalItens = {
      text: `Valor total - R$ ${valorTotalUtilizado()}`,
      fontSize: 10,
      margin: [0, 4],
      alignment: "right",
    };

    docDefinition.content.push(
      separacao,
      tabelaGeral,
      totalItens,
      quebrarPagina
    );

    // Pagina de cada item
    for (let index = 0; index < itens.length; index++) {
      const value = itens[index];

      const orcamentos = await Orcamento.findAll({
        raw: true,
        where: { idItem: value.id },
      });

      // Pega o menor dos or??amentos de determinado item
      let verificarMenorOrcamento = Number(value.valorTotal);
      // contador de empresas diferentes
      let empresas = [];

      // Verificar o menor orcamento do item e a quantidade de empresas diferentes
      orcamentos.forEach((value) => {
        // verefica a quantidade de empresas que foram or??adas
        if (
          !empresas.includes(value.cnpjFavorecido) &&
          value.cnpjFavorecido !== null
        ) {
          if (value.cnpjFavorecido.length !== 0)
            empresas.push(value.cnpjFavorecido);
        }

        // verifica o valor de cada orcamento com o valor do item
        if (verificarMenorOrcamento > Number(value.valorTotal)) {
          verificarMenorOrcamento = Number(value.valorTotal);
        }
      });

      let idItem = {
        text: ".",
        id: `item${index + 1}`,
        absolutePosition: { x: 0, y: 0 },
        fontSize: 1,
      };

      let titulo = {
        text: `Item ${index + 1} - ${
          value.nomeMaterialServico !== null &&
          value.nomeMaterialServico.length !== 0
            ? value.nomeMaterialServico
            : "Nome n??o informado"
        }`,
        alignment: "center",
        id: `descricao${index + 1}`,
        fontSize: 15,
        margin: [0, 0, 0, 15],
      };

      let data;
      if (
        value.dataCompraContratacao !== null &&
        value.dataCompraContratacao !== "0000-00-00"
      )
        data = value.dataCompraContratacao.split("-");

      let tituloDocumentoFiscal = {
        text: "Documento fiscal:",
        fontSize: 12,
        margin: [0, 0, 0, 5],
      };

      let table = {
        table: {
          widths: [200, 338.5],
          body: [
            [
              { text: "N?? do item", style: "tituloTable" },
              { text: index + 1, style: "celulaTable" },
            ],
            [
              {
                text: "Detalhamento",
                style: "tituloTable",
              },
              {
                text: [
                  value.nomeMaterialServico !== null &&
                  value.nomeMaterialServico.length !== 0
                    ? {
                        text: `Nome - ${value.nomeMaterialServico}\n`,
                        lineHeight: 1.2,
                      }
                    : { text: "Nome - n??o informado \n", lineHeight: 1.2 },
                  value.descricao !== null && value.descricao.length !== 0
                    ? {
                        text: `Descri????o - ${value.descricao}\n`,
                        lineHeight: 1.2,
                      }
                    : { text: "Descri????o - n??o informada \n", lineHeight: 1.2 },
                  value.marca !== null && value.marca.length !== 0
                    ? { text: `Marca - ${value.marca}\n`, lineHeight: 1.2 }
                    : { text: "Marca - n??o informada \n", lineHeight: 1.2 },
                  value.modelo !== null && value.modelo.length !== 0
                    ? { text: `Modelo - ${value.modelo}`, lineHeight: 1 }
                    : { text: "Modelo - n??o informado", lineHeight: 1 },
                ],
                style: "celulaTable",
              },
            ],
            [
              { text: "Tipo", style: "tituloTable" },
              {
                text: `${value.tipo} - (${value.despesa})`,
                style: "celulaTable",
              },
            ],
            [
              { text: "Data do documento fiscal", style: "tituloTable" },
              data !== undefined
                ? {
                    text: [`${data[2]}/${data[1]}/${data[0]}`],
                    style: "celulaTable",
                  }
                : { text: "N??o informada", style: "celulaTable" },
            ],
            [
              { text: "Favorecido", style: "tituloTable" },
              value.cnpjFavorecido !== null && value.cnpjFavorecido.length !== 0
                ? {
                    text: value.cnpjFavorecido.replace(
                      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
                      "$1.$2.$3/$4-$5"
                    ),
                    style: "celulaTable",
                  }
                : { text: "N??o informado", style: "celulaTable" },
            ],
            [
              { text: "N?? do documento fiscal", style: "tituloTable" },
              value.numeroDocumentoFiscal !== null &&
              value.numeroDocumentoFiscal.length !== 0
                ? { text: value.numeroDocumentoFiscal, style: "celulaTable" }
                : { text: "N??mero n??o informado", style: "celulaTable" },
            ],
            [
              { text: "Valor unit??rio", style: "tituloTable" },
              { text: `R$ ${value.valorUnitario}`, style: "celulaTable" },
            ],
            [
              { text: "Quantidade", style: "tituloTable" },
              { text: value.quantidade, style: "celulaTable" },
            ],
            [
              { text: "Frete", style: "tituloTable" },
              { text: `R$ ${value.frete}`, style: "celulaTable" },
            ],
            [
              { text: "Valor total", style: "tituloTable" },
              { text: `R$ ${value.valorTotal}`, style: "celulaTable" },
            ],
            [
              { text: "Anexo documento fiscal", style: "tituloTable" },

              value.pathAnexo
                ? {
                    text: value.pathAnexo,
                    style: ["celulaTable", "link"],
                    link: `pdfs/${value.pathAnexo}`,
                  }
                : { text: "Nenhum anexo", style: "celulaTable" },
            ],
          ],
        },
        layout: {
          vLineWidth: () => 0.2,
          hLineWidth: () => 0.2,
        },
      };

      // resumo documento fiscal
      let resumoDocumentoFiscal = {
        table: {
          widths: [265, 200],
          body: [
            [
              {
                text: "Data da aquisi????o anterior ao prazo do Edital:",
                fontSize: 10,
              },
              data !== undefined
                ? verificarDataLimite(
                    edital[0].dataLimitePrestacao,
                    value.dataCompraContratacao
                  )
                  ? { text: "Sim.", fontSize: 10 }
                  : { text: "N??o.", fontSize: 10 }
                : { text: "Data n??o informada.", fontSize: 10 },
            ],
            [
              {
                text: "Documento fiscal emitido com o cpf do pesquisador:",
                fontSize: 10,
              },
              value.isCompradoComCpfCoordenador === 1
                ? { text: `Sim.`, fontSize: 10 }
                : { text: `N??o.`, fontSize: 10 },
            ],
            orcamentos.length > 0
              ? [
                  {
                    text: "Aquisi????o do or??amento com menor valor:",
                    fontSize: 10,
                  },
                  verificarMenorOrcamento.toFixed(2) === value.valorTotal
                    ? { text: "Sim.", fontSize: 10 }
                    : { text: "N??o.", fontSize: 10 },
                ]
              : [{ text: "" }, { text: "" }],
            orcamentos.length > 0
              ? [
                  {
                    text: "Fornecedores com CNPJ diferente:",
                    fontSize: 10,
                  },
                  empresas.length !== 0
                    ? { text: empresas.length, fontSize: 10 }
                    : {
                        text: "Nenhuma empresa informada.",
                        fontSize: 10,
                      },
                ]
              : [{ text: "" }, { text: "" }],
          ],
        },
        layout: "noBorders",
      };

      // Tabelas dos orcamentos anexados
      let tabelaOrcamento = {
        style: "lista",
        type: "none",
        ul: [],
      };

      //data item
      let dataItem;
      if (
        value.dataCompraContratacao !== null &&
        value.dataCompraContratacao !== "0000-00-00"
      )
        dataItem = value.dataCompraContratacao;

      orcamentos.forEach((value, index) => {
        if (value.pathAnexo) {
          let anexoOrcamento = `${process.cwd()}/uploads/${value.pathAnexo}`;
          zip.addLocalFile(anexoOrcamento, "Relatorio/pdfs");
        }

        let data;
        if (
          value.dataOrcamento !== null &&
          value.dataOrcamento !== "0000-00-00"
        )
          data = value.dataOrcamento.split("-");
        tabelaOrcamento.ul.push(
          [
            {
              text: `Or??amento ${index + 1}:`,
              fontSize: 12,
              margin: [0, 0, 0, 5],
            },
            {
              table: {
                widths: [200, 298.5],
                body: [
                  [
                    { text: "Detalhamento", style: "tituloTable" },
                    {
                      text: [
                        value.nomeMaterialServico !== null &&
                        value.nomeMaterialServico.length !== 0
                          ? {
                              text: `Nome - ${value.nomeMaterialServico}\n`,
                              lineHeight: 1.2,
                            }
                          : {
                              text: "Nome - n??o informado \n",
                              lineHeight: 1.2,
                            },
                        value.marca !== null && value.marca.length !== 0
                          ? {
                              text: `Marca - ${value.marca}\n`,
                              lineHeight: 1.2,
                            }
                          : {
                              text: "Marca - n??o informada \n",
                              lineHeight: 1.2,
                            },
                        value.modelo !== null && value.modelo.length !== 0
                          ? { text: `Modelo - ${value.modelo}`, lineHeight: 1 }
                          : { text: "Modelo - n??o informado", lineHeight: 1 },
                      ],
                      style: "celulaTable",
                    },
                  ],
                  [
                    { text: "Data do or??amento", style: "tituloTable" },
                    data !== undefined
                      ? {
                          text: `${data[2]}/${data[1]}/${data[0]}`,
                          style: "celulaTable",
                        }
                      : { text: "N??o informada", style: "celulaTable" },
                  ],
                  [
                    { text: "Favorecido", style: "tituloTable" },
                    value.cnpjFavorecido !== null &&
                    value.cnpjFavorecido.length !== 0
                      ? {
                          text: value.cnpjFavorecido.replace(
                            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
                            "$1.$2.$3/$4-$5"
                          ),
                          style: "celulaTable",
                        }
                      : { text: "N??o informado", style: "celulaTable" },
                  ],
                  [
                    { text: "Valor unit??rio", style: "tituloTable" },
                    { text: `R$ ${value.valorUnitario}`, style: "celulaTable" },
                  ],
                  [
                    { text: "Quantidade", style: "tituloTable" },
                    { text: value.quantidade, style: "celulaTable" },
                  ],
                  [
                    { text: "Frete", style: "tituloTable" },
                    { text: `R$ ${value.frete}`, style: "celulaTable" },
                  ],
                  [
                    { text: "Valor total", style: "tituloTable" },
                    { text: `R$ ${value.valorTotal}`, style: "celulaTable" },
                  ],
                  [
                    { text: "Anexo do or??amento", style: "tituloTable" },
                    value.pathAnexo
                      ? {
                          text: value.pathAnexo,
                          style: ["celulaTable", "link"],
                          link: `pdfs/${value.pathAnexo}`,
                        }
                      : { text: "Nenhum anexo", style: "celulaTable" },
                  ],
                ],
              },
              layout: {
                vLineWidth: () => 0.2,
                hLineWidth: () => 0.2,
              },
            },
          ],
          separacao,
          {
            // resumo or??amento
            table: {
              widths: [230, 300],

              body: [
                [
                  { text: "Or??amento realizado anterior a data limite:" },
                  data !== undefined
                    ? verificarDataLimite(
                        edital[0].dataLimitePrestacao,
                        value.dataOrcamento
                      )
                      ? { text: "Sim.", fontSize: 10 }
                      : { text: "N??o.", fontSize: 10 }
                    : { text: "Data n??o informada.", fontSize: 10 },
                ],
                [
                  { text: "Or??amento realizado anterior a aquisi????o:" },
                  dataItem !== undefined && data !== undefined
                    ? verificarDataLimite(dataItem, value.dataOrcamento)
                      ? { text: "Sim.", fontSize: 10 }
                      : { text: "N??o.", fontSize: 10 }
                    : {
                        text: "Data do or??amento ou documento fiscal n??o informada.",
                        fontSize: 10,
                      },
                ],
                [
                  { text: "Or??amento realizado com o cpf do pesquisador:" },
                  value.isOrcadoComCpfCoordenador === 1
                    ? { text: "Sim." }
                    : { text: "N??o." },
                ],
                [
                  { text: "Or??amento escolhido para realizar a compra:" },
                  value.isOrcamentoCompra === 1
                    ? { text: "Sim." }
                    : { text: "N??o." },
                ],
              ],
            },
            layout: "noBorders",
          },
          separacao
        );
      });

      const justificativa = await Justificativa.findAll({
        raw: true,
        where: { idItem: value.id },
      });

      tabelaJustificativa = {
        style: "lista",
        type: "none",
        ul: [],
      };

      justificativa.forEach((value) => {
        if (value.pathAnexo) {
          let anexoJustificativa = `${process.cwd()}/uploads/${
            value.pathAnexo
          }`;
          zip.addLocalFile(anexoJustificativa, "Relatorio/pdfs");
        }

        tabelaJustificativa.ul.push([
          {
            text: `Justificativa:`,
            fontSize: 12,
            margin: [0, 0, 0, 5],
          },
          {
            table: {
              widths: [200, 298.5],
              body: [
                [
                  { text: "Anexo da justificativa", style: "tituloTable" },
                  value.pathAnexo
                    ? {
                        text: value.pathAnexo,
                        style: ["celulaTable", "link"],
                        link: `pdfs/${value.pathAnexo}`,
                      }
                    : { text: "Nenhum anexo", style: "celulaTable" },
                ],
              ],
            },
            layout: {
              vLineWidth: () => 0.2,
              hLineWidth: () => 0.2,
            },
          },
        ]);
      });

      // Quebras de p??gina
      if (itens.length - 1 !== index) {
        tabelaJustificativa.pageBreak = "after";
      }

      // Partes do PDF final
      docDefinition.content.push(
        idItem,
        titulo,
        tituloDocumentoFiscal,
        table,
        separacao,
        resumoDocumentoFiscal,
        orcamentos.length > 0 ? tabelaOrcamento : "",
        itens.length - 1 !== index
          ? justificativa.length === 0
            ? quebrarPagina
            : ""
          : "",
        justificativa.length > 0 ? tabelaJustificativa : ""
      );
    }

    //Gru arquivos
    if (gru.length > 0) {
      gru.forEach((value) => {
        if (value.pathAnexoGruCusteio) {
          let pathAnexoGruCusteio = `${process.cwd()}/uploads/${
            value.pathAnexoGruCusteio
          }`;
          zip.addLocalFile(pathAnexoGruCusteio, "Relatorio/pdfs");
        }
        if (value.pathAnexoGruCapital) {
          let pathAnexoGruCapital = `${process.cwd()}/uploads/${
            value.pathAnexoGruCapital
          }`;
          zip.addLocalFile(pathAnexoGruCapital, "Relatorio/pdfs");
        }
        if (value.pathAnexoComprovanteCusteio) {
          let pathAnexoComprovanteCusteio = `${process.cwd()}/uploads/${
            value.pathAnexoComprovanteCusteio
          }`;
          zip.addLocalFile(pathAnexoComprovanteCusteio, "Relatorio/pdfs");
        }
        if (value.pathAnexoComprovanteCapital) {
          let pathAnexoComprovanteCapital = `${process.cwd()}/uploads/${
            value.pathAnexoComprovanteCapital
          }`;
          zip.addLocalFile(pathAnexoComprovanteCapital, "Relatorio/pdfs");
        }
      });

      let linkGru = {
        text: ".",
        fontSize: 1,
        absolutePosition: { x: 0, y: 0 },
        id: "gru",
      };

      let tituloGru = {
        text: "GRU - Guia de Recolhimento da Uni??o",
        margin: [0, 0, 0, 10],
      };

      let tabelaGru = {
        table: {
          widths: [269.25, 269.25],
          body: [
            [
              {
                text: "Custeio",
                alignment: "center",
                bold: true,
                fontSize: 15,
                margin: [0, 3],
              },
              {
                text: "Capital",
                alignment: "center",
                bold: true,
                fontSize: 15,
                margin: [0, 3],
              },
            ],
            [
              {
                text: [
                  { text: "Valor total: \n", alignment: "left", bold: true },
                  {
                    text: `R$ ${projeto[0].valorRecebidoCusteio}`,
                    style: "celulaTable",
                  },
                ],
              },
              {
                text: [
                  { text: "Valor total: \n", alignment: "left", bold: true },
                  {
                    text: `R$ ${projeto[0].valorRecebidoCapital}`,
                    style: "celulaTable",
                  },
                ],
              },
            ],
            [
              {
                text: [
                  { text: "Valor restante: \n", alignment: "left", bold: true },
                  {
                    text: `R$ ${
                      Number(projeto[0].valorRecebidoCusteio) -
                      Number(gru[0].valorTotalCusteio)
                    }`,
                    style: "celulaTable",
                  },
                ],
              },
              {
                text: [
                  { text: "Valor restante: \n", alignment: "left", bold: true },
                  {
                    text: `R$ ${
                      Number(projeto[0].valorRecebidoCapital) -
                      Number(gru[0].valorTotalCapital)
                    }`,
                    style: "celulaTable",
                  },
                ],
              },
            ],
            [
              {
                text: [
                  {
                    text: "Valor devolvido: \n",
                    alignment: "left",
                    bold: true,
                  },
                  {
                    text: `R$ ${gru[0].valorTotalCusteio}`,
                    style: "celulaTable",
                  },
                ],
              },
              {
                text: [
                  {
                    text: "Valor devolvido: \n",
                    alignment: "left",
                    bold: true,
                  },
                  {
                    text: `R$ ${gru[0].valorTotalCapital}`,
                    style: "celulaTable",
                  },
                ],
              },
            ],
            [
              {
                text: [
                  { text: "Anexo GRU: \n", alignment: "left", bold: true },
                  gru[0].pathAnexoGruCusteio
                    ? {
                        text: gru[0].pathAnexoGruCusteio,
                        link: `pdfs/${gru[0].pathAnexoGruCusteio}`,
                        style: ["link", "celulaTable"],
                      }
                    : { text: "Nenhum anexo", style: "celulaTable" },
                ],
              },
              {
                text: [
                  { text: "Anexo GRU: \n", alignment: "left", bold: true },
                  gru[0].pathAnexoGruCapital
                    ? {
                        text: gru[0].pathAnexoGruCapital,
                        link: `pdfs/${gru[0].pathAnexoGruCapital}`,
                        style: ["link", "celulaTable"],
                      }
                    : { text: "Nenhum anexo", style: "celulaTable" },
                ],
              },
            ],
            [
              {
                text: [
                  {
                    text: "Anexo comprovante: \n",
                    alignment: "left",
                    bold: true,
                  },
                  gru[0].pathAnexoComprovanteCusteio
                    ? {
                        text: gru[0].pathAnexoComprovanteCusteio,
                        link: `pdfs/${gru[0].pathAnexoComprovanteCusteio}`,
                        style: ["link", "celulaTable"],
                      }
                    : { text: "Nenhum anexo", style: "celulaTable" },
                ],
              },
              {
                text: [
                  {
                    text: "Anexo comprovante: \n",
                    alignment: "left",
                    bold: true,
                  },
                  gru[0].pathAnexoComprovanteCapital
                    ? {
                        text: gru[0].pathAnexoComprovanteCapital,
                        link: `pdfs/${gru[0].pathAnexoComprovanteCapital}`,
                        style: ["link", "celulaTable"],
                      }
                    : { text: "Nenhum anexo", style: "celulaTable" },
                ],
              },
            ],
          ],
        },
        layout: {
          vLineWidth: () => 0.2,
          hLineWidth: () => 0.2,
        },
      };

      docDefinition.content.push(quebrarPagina, linkGru, tituloGru, tabelaGru);
    }

    let pdfDoc = printer.createPdfKitDocument(docDefinition);

    //pdfDoc.pipe(res);

    pdfDoc.end();

    let streamToString = pdfDoc.read();

    zip.addFile(
      "Relatorio/relatorio.pdf",
      streamToString,
      "entry comment goes here"
    );

    const read = `-=-=-=-=-=-=-=-=-=-=- IMPORTANTE -=-=-=-=--=-=-=-=-=-=
N??o altere o nome de nenhum arquivo ou pasta,
para n??o corromper o pdf principal.
Muito obrigado pela sua colabora????o. :)
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

`;
    zip.addFile("Relatorio/README.txt", read, "");

    //let anexoItem = `${process.cwd()}/uploads/${value.pathAnexo}`;

    //zip.addLocalFile(pdfs, "Relatorio/anexoItem");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Relatorio.zip",
      "content-type",
      "application/zip"
    );

    const willsendthis = zip.toBuffer();
    res.send(willsendthis);
  },
};

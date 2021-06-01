const { validationResult } = require("express-validator");
const sequelize = require("../services/db");
const Projeto = sequelize.models.Projeto;
const Item = sequelize.models.Item;
const Orcamento = sequelize.models.Orcamento;
const Justificativa = sequelize.models.Justificativa;
const AdmZip = require("adm-zip");

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
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const projetos = await Projeto.findByPk(req.params.id, { raw: true });

    return res.json({
      user: req.user,
      token: req.token,
      results: [projetos],
    });
  },
  post: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const results = await Projeto.bulkCreate(req.body.projetos);

    res
      .status(200)
      .json({ user: req.user, token: req.token, results: results });
  },
  put: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

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
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const ids = req.body.projetos.map((projeto) => projeto.id);

    const results = await Projeto.destroy({ where: { id: ids } });

    res
      .status(200)
      .json({ token: req.token, user: req.user, results: results });
  },

  getRelatorio: async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.sendStatus(400);
    }

    const zip = new AdmZip();

    const projeto = await Projeto.findAll({
      raw: true,
      where: { id: req.params.id },
    });
    const itens = await Item.findAll({
      raw: true,
      where: { idProjeto: req.params.id },
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
          Ministério da Educação\n
          Secretaria de Educação Profissional e Tecnológica\n
          Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul\n
          Pró-reitoria de Pesquisa, Pós-graduação e Inovação / Pró-reitoria de Extensão/ Pró-reitoria de Ensino /Pró-reitoria de Administração\n
           Rua Gen. Osório, 348 – Centro – Bento Gonçalves/RS – CEP 95.700-086\n
          Telefone: (54) 3449.3300 – www.ifrs.edu.br –\n
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
        text: "início",
        alignment: "center",
        linkToDestination: "home",
        margin: [0, 20, 0, 0],
      },

      content: [
        {
          text: `Relatório: ${projeto[0].nome}`,
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
                { text: "Título do programa ou projeto", style: "tituloTable" },
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
                  text: "Número do edital que concedeu recurso",
                  style: "tituloTable",
                },
                { text: "nao tem no banco", style: "celulaTable" },
              ],
              [
                { text: "Campus", style: "tituloTable" },
                { text: "Feliz", style: "celulaTable" },
              ],
              [
                { text: "Valor total recebido", style: "tituloTable" },
                { text: projeto[0].valorRecebidoTotal, style: "celulaTable" },
              ],
              [
                { text: "Valor total utilizado", style: "tituloTable" },
                { text: valorTotalUtilizado(), style: "celulaTable" },
              ],
              [
                { text: "Valor total devolvido (GRU)", style: "tituloTable" },
                { text: "nao tem no banco", style: "celulaTable" },
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
    // Tabela com todos as informacoes dos documentos fiscais

    let tabelaGeral = {
      table: {
        widths: [20, "*", 60, 40, 55, 75, 35, 30, 35, 40],
        headerRows: 1,
        body: [
          [
            { text: "Nº do item", style: "tableHeader" },
            { text: "Nome do item", style: "tableHeader" },
            { text: "Tipo", style: "tableHeader" },
            { text: "Data", style: "tableHeader" },
            { text: "Favorecido", style: "tableHeader" },
            { text: "Nº do documento fiscal", style: "tableHeader" },
            { text: "Valor unitário", style: "tableHeader" },
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

    itens.forEach((value, index) => {
      if (value.pathAnexo) {
        let anexoItem = `${process.cwd()}/uploads/${value.pathAnexo}`;
        zip.addLocalFile(anexoItem, "Relatorio/pdfs");
      }

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
            { text: value.nomeMaterialServico },
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
        {
          text: value.dataCompraContratacao,
          style: "celulaTabelaGeral",
        },
        {
          text: value.cnpjFavorecido.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
            "$1.$2.$3/$4-$5"
          ),
          style: "celulaTabelaGeral",
        },
        {
          text: value.numeroDocumentoFiscal,
          style: "celulaTabelaGeral",
        },
        {
          text: value.valorUnitario,
          style: "celulaTabelaGeral",
        },
        {
          text: value.quantidade,
          style: "celulaTabelaGeral",
        },
        {
          text: value.frete,
          style: "celulaTabelaGeral",
        },
        {
          text: value.valorTotal,
          style: "celulaTabelaGeral",
        },
      ]);
    });

    docDefinition.content.push(separacao, tabelaGeral, quebrarPagina);

    // Pagina de cada item
    for (let index = 0; index < itens.length; index++) {
      const value = itens[index];

      let idItem = {
        text: ".",
        id: `item${index + 1}`,
        absolutePosition: { x: 0, y: 0 },
        fontSize: 1,
      };

      let titulo = {
        text: `Item ${index + 1} - ${value.nomeMaterialServico}`,
        alignment: "center",
        id: `descricao${index + 1}`,
        fontSize: 15,
        margin: [0, 0, 0, 15],
      };

      let data = value.dataCompraContratacao.split("-");

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
              { text: "Nº do item", style: "tituloTable" },
              { text: index + 1, style: "celulaTable" },
            ],
            [
              {
                text: "Detalhamento",
                style: "tituloTable",
              },
              {
                text: [
                  {
                    text: `Nome - ${value.nomeMaterialServico}\n`,
                    lineHeight: 1.2,
                  },
                  {
                    text: `Descrição - ${value.descricao}\n`,
                    lineHeight: 1.2,
                  },
                  { text: `Marca - ${value.marca}\n`, lineHeight: 1.2 },
                  { text: `Modelo - ${value.modelo}`, lineHeight: 1 },
                ],
                style: "celulaTable",
              },
            ],
            [
              { text: "Tipo", style: "tituloTable" },
              { text: value.tipo, style: "celulaTable" },
            ],
            [
              { text: "Data", style: "tituloTable" },
              {
                text: [`${data[2]}/${data[1]}/${data[0]}`],
                style: "celulaTable",
              },
            ],
            [
              { text: "Favorecido", style: "tituloTable" },
              {
                text: value.cnpjFavorecido.replace(
                  /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
                  "$1.$2.$3/$4-$5"
                ),
                style: "celulaTable",
              },
            ],
            [
              { text: "Nº do documento fiscal", style: "tituloTable" },
              { text: value.numeroDocumentoFiscal, style: "celulaTable" },
            ],
            [
              { text: "Valor unitário", style: "tituloTable" },
              { text: value.valorUnitario, style: "celulaTable" },
            ],
            [
              { text: "Quantidade", style: "tituloTable" },
              { text: value.quantidade, style: "celulaTable" },
            ],
            [
              { text: "Frete", style: "tituloTable" },
              { text: value.frete, style: "celulaTable" },
            ],
            [
              { text: "Valor total", style: "tituloTable" },
              { text: value.valorTotal, style: "celulaTable" },
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
          widths: [265, 20],
          body: [
            [
              {
                text: "Documento fiscal realizado anterior a data limite:",
                fontSize: 10,
              },
              { text: "s/n", fontSize: 10 },
            ],
            [
              {
                text: "Documento fiscal realizado com o cpf do pesquisador:",
                fontSize: 10,
              },
              { text: "s/n", fontSize: 10 },
            ],
            [
              {
                text: "Documento fiscal referente ao orçamento de menor preço:",
                fontSize: 10,
              },
              { text: "s/n", fontSize: 10 },
            ],
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

      const orcamentos = await Orcamento.findAll({
        raw: true,
        where: { idItem: value.id },
      });

      orcamentos.forEach((value, index) => {
        if (value.pathAnexo) {
          let anexoOrcamento = `${process.cwd()}/uploads/${value.pathAnexo}`;
          zip.addLocalFile(anexoOrcamento, "Relatorio/pdfs");
        }

        let data = value.dataOrcamento.split("-");
        tabelaOrcamento.ul.push(
          [
            {
              text: `Orçamento ${index + 1}:`,
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
                        {
                          text: `Nome - ${value.nomeMaterialServico}\n`,
                          lineHeight: 1.2,
                        },
                        { text: `Marca - ${value.marca}\n`, lineHeight: 1.2 },
                        { text: `Modelo - ${value.modelo}`, lineHeight: 1 },
                      ],
                      style: "celulaTable",
                    },
                  ],
                  [
                    { text: "Data", style: "tituloTable" },
                    {
                      text: `${data[2]}/${data[1]}/${data[0]}`,
                      style: "celulaTable",
                    },
                  ],
                  [
                    { text: "Favorecido", style: "tituloTable" },
                    {
                      text: value.cnpjFavorecido.replace(
                        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
                        "$1.$2.$3/$4-$5"
                      ),
                      style: "celulaTable",
                    },
                  ],
                  [
                    { text: "Valor unitário", style: "tituloTable" },
                    { text: value.valorUnitario, style: "celulaTable" },
                  ],
                  [
                    { text: "Quantidade", style: "tituloTable" },
                    { text: value.quantidade, style: "celulaTable" },
                  ],
                  [
                    { text: "Frete", style: "tituloTable" },
                    { text: value.frete, style: "celulaTable" },
                  ],
                  [
                    { text: "Valor total", style: "tituloTable" },
                    { text: value.valorTotal, style: "celulaTable" },
                  ],
                  [
                    { text: "Anexo do orçamento", style: "tituloTable" },
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
            // resumo orçamento
            table: {
              widths: [230, 20],

              body: [
                [
                  { text: "Orçamento realizado anterior a data limite:" },
                  { text: "s/n" },
                ],
                [
                  { text: "Orçamento realizado anterior ao documento fiscal:" },
                  { text: "s/n" },
                ],
                [
                  { text: "Orçamento realizado com o cpf do pesquisador:" },
                  { text: "s/n" },
                ],
                [
                  { text: "Orçamento escolhido para realizar a compra:" },
                  { text: "s/n" },
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
      console.log(justificativa);

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

      // Quebras de página
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
        justificativa.length === 0 ? quebrarPagina : "",
        justificativa.length > 0 ? tabelaJustificativa : ""
      );
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
Não altere o nome de nenhum arquivo ou pasta,
para não corromper o pdf principal.
Muito obrigado pela sua colaboração. :)
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

`;
    zip.addFile("Relatorio/README.txt", read, "", "r");

    //console.log(itens);

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

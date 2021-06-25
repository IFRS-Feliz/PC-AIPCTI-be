const sequelize = require("../services/db");
const Gru = sequelize.models.Gru;
const mime = require("mime");
const fs = require("fs").promises;
const path = require("path");
const { getAnexoFileName } = require("../middleware");
const { validationResult } = require("express-validator");

function gruFileIsComprovanteOrGru(value) {
  const type = value;
  if (
    ![
      "pathAnexoGruCusteio",
      "pathAnexoComprovanteCusteio",
      "pathAnexoGruCapital",
      "pathAnexoComprovanteCapital",
    ].includes(type)
  ) {
    throw new Error(
      "gru file type must be either pathAnexoGru or pathAnexoComprovante"
    );
  }
  return true;
}

module.exports = {
  get: async (req, res) => {
    const idProjeto = req.params.id;
    const gru = await Gru.findAll({ where: { idProjeto: idProjeto } });
    res.json({ user: req.user, token: req.token, results: gru });
  },
  post: async (req, res) => {
    const gru = req.body.gru;
    const result = await Gru.create(gru, {
      fields: ["idProjeto", "valorTotalCusteio", "valorTotalCapital"],
    });
    res.json({ user: req.user, token: req.token, results: [result] });
  },
  put: async (req, res) => {
    const gru = req.body.gru;
    const result = await Gru.update(gru, {
      where: { id: gru.id },
      fields: ["valorTotalCusteio", "valorTotalCapital"],
    });

    res.json({ user: req.user, token: req.token, results: [result] });
  },
  getFile: async (req, res) => {
    const idProjeto = req.params.id;
    const type = req.query.type;

    const [results] = await Gru.findAll({
      where: { idProjeto: idProjeto },
      raw: true,
      attributes: [type],
    }).catch((error) => {
      res.status(500).send(error);
    });

    if (results) {
      const fileName = results[type];
      if (!fileName) return res.json({ user: req.user, token: req.token });
      try {
        const file = await fs.readFile("uploads/" + fileName);

        res.setHeader("content-type", mime.getType(fileName));
        res.send(file);
      } catch (error) {
        res.status(500).send(error);
      }
    } else res.json({ user: req.user, token: req.token });
  },
  postFile: async (req, res) => {
    const id = req.params.id;
    const file = req.file;
    const type = req.query.type;

    if (!file | !id) return res.json({ user: req.user, token: req.token });

    const [lookup] = await Gru.findAll({
      where: { idProjeto: id },
      raw: true,
      attributes: [type],
    });

    if (!lookup) return res.json({ user: req.user, token: req.token });

    const { uuid, ext } = getAnexoFileName(file);
    let newFileName;

    if (!lookup[type]) {
      newFileName = `${uuid}${ext}`;
      fs.writeFile(`uploads/${newFileName}`, file.buffer);
    } else {
      const oldExt = path.extname(lookup[type]);

      if (oldExt === ext) {
        fs.writeFile(`uploads/${lookup[type]}`, file.buffer);
        return res.json({ user: req.user, token: req.token });
      } else {
        newFileName = `${lookup[type].split(".")[0]}${ext}`;
        fs.writeFile(`uploads/${lookup[type]}`, file.buffer).then(() =>
          fs.rename(`uploads/${lookup[type]}`, `uploads/${newFileName}`)
        );
      }
    }

    try {
      const results = await Gru.update(
        { [type]: newFileName },
        { where: { idProjeto: id } }
      );
      res.json({ user: req.user, token: req.token, results: results });
    } catch (error) {
      res.status(500).send(error);
    }
  },
  deleteFile: async (req, res) => {
    const id = req.params.id;
    const type = req.query.type;

    const [lookup] = await Gru.findAll({
      where: { idProjeto: id },
      raw: true,
      attributes: [type],
    });

    if (!lookup) return res.json({ user: req.user, token: req.token });

    if (!lookup[type]) return res.json({ user: req.user, token: req.token });

    await fs.unlink(`uploads/${lookup[type]}`);

    const results = await Gru.update(
      { [type]: null },
      { where: { idProjeto: id } }
    );

    res.json({ user: req.user, token: req.token, results: results });
  },
  gruFileIsComprovanteOrGru,
};

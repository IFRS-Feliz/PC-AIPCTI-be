const fs = require("fs").promises;
const path = require("path");
const { getAnexoFileName } = require("../middleware");
const mime = require("mime");

module.exports = {
  getFile: (Model) => {
    return async (req, res) => {
      const id = req.params.id;

      const results = await Model.findByPk(id, {
        raw: true,
        attributes: ["pathAnexo"],
      }).catch((error) => res.status(500).send(error));

      if (results) {
        const fileName = results.pathAnexo;
        if (!fileName) return res.json({ user: req.user, token: req.token });
        try {
          const file = await fs.readFile("uploads/" + fileName);

          res.send({
            user: req.user,
            token: req.token,
            file: file,
            fileMime: mime.getType(fileName),
          });
        } catch (error) {
          res.status(500).send(error);
        }
      } else res.json({ user: req.user, token: req.token });
    };
  },
  postFile: (Model) => {
    return async (req, res) => {
      const id = req.params.id;
      const file = req.file;

      if (!file | !id) return res.json({ user: req.user, token: req.token });

      const lookup = await Model.findByPk(id, { raw: true });

      if (!lookup) return res.json({ user: req.user, token: req.token });

      const { uuid, ext } = getAnexoFileName(file);
      let newFileName;

      if (!lookup.pathAnexo) {
        newFileName = `${uuid}${ext}`;
        fs.writeFile(`uploads/${newFileName}`, file.buffer);
      } else {
        const oldExt = path.extname(lookup.pathAnexo);

        if (oldExt === ext) {
          fs.writeFile(`uploads/${lookup.pathAnexo}`, file.buffer);
          return res.json({ user: req.user, token: req.token });
        } else {
          newFileName = `${lookup.pathAnexo.split(".")[0]}${ext}`;
          fs.writeFile(`uploads/${lookup.pathAnexo}`, file.buffer).then(() =>
            fs.rename(`uploads/${lookup.pathAnexo}`, `uploads/${newFileName}`)
          );
        }
      }

      try {
        const results = await Model.update(
          { pathAnexo: newFileName },
          { where: { id: id } }
        );
        res.json({ user: req.user, token: req.token, results: results });
      } catch (error) {
        res.status(500).send(error);
      }
    };
  },
  deleteFile: (Model) => {
    return async (req, res) => {
      const id = req.params.id;

      const lookup = await Model.findByPk(id, { raw: true });

      if (!lookup) return res.json({ user: req.user, token: req.token });

      if (!lookup.pathAnexo)
        return res.json({ user: req.user, token: req.token });

      await fs.unlink(`uploads/${lookup.pathAnexo}`);

      const results = await Model.update(
        { pathAnexo: null },
        { where: { id: id } }
      );

      res.json({ user: req.user, token: req.token, results: results });
    };
  },
};

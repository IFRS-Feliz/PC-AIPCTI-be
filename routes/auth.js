const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const connection = require("../db");

router.route("/login").post((req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) return res.sendStatus(401);

  connection.query(
    "SELECT * FROM usuario WHERE email=? AND senha=?",
    [email, password],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        const user = {
          name: results[0].nome,
          email: results[0].email,
          isAdmin: results[0].isAdmin,
        };

        const token = jwt.sign(user, process.env.SECRET, { expiresIn: "10s" });
        const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET);
        //futuramente adicionar refreshToken no db
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 365 * 1000 * 10,
        });

        res.json({ token: token });
      } else {
        res.sendStatus(401);
      }
    }
  );
});

router.route("/logout").get((req, res) => {
  //futuramente remover refreshToken do db
  res.clearCookie("refreshToken");
  res.sendStatus(200);
});

module.exports = router;

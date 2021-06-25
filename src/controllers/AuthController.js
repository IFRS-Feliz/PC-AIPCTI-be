const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../db").models.User;

module.exports = {
  login: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) return res.sendStatus(401);

    const users = await User.findAll({ where: { email: email }, raw: true });

    if (!users || users.length !== 1) return res.sendStatus(401);

    const isPasswordCorrect = await bcrypt.compare(password, users[0].senha);

    if (!isPasswordCorrect) return res.sendStatus(401);

    const user = {
      cpf: users[0].cpf,
      name: users[0].nome,
      email: users[0].email,
      isAdmin: users[0].isAdmin,
    };

    const token = jwt.sign(user, process.env.SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET);
    //futuramente adicionar refreshToken no db
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 1000 * 10,
    });

    res.json({ user: user, token: token });
  },
  logout: (req, res) => {
    //futuramente remover refreshToken do db
    res.clearCookie("refreshToken");
    res.sendStatus(200);
  },
};

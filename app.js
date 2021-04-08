const cors = require("cors");

const express = require("express");
const app = express();
const port = 5000;

const mysql = require("mysql");
const session = require("express-session");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    key: "userId",
    secret: "dijfoisdjfasf01923fi203fj92u3f09",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 365,
    },
  })
);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "prestacaoContas",
});
connection.connect((err) => {
  if (err) {
    console.log(err);
  }
});

app.post("/login", (req, res) => {
  connection.query(
    "SELECT * FROM usuario WHERE email=? AND senha=?",
    [req.body.email, req.body.password],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        req.session.user = results[0];
        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
        });
      } else {
        res.status(401).json({ isAuthenticated: false });
      }
    }
  );
});

app.get("/usuario", (req, res) => {
  connection.query("SELECT * FROM usuario", (error, results, fields) => {
    if (error) {
      throw error;
    }
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
          results,
        });
      } else {
        res.status(403).json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: false,
        });
      }
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  });
});

app.get("/projeto", (req, res) => {
  if (req.session.user) {
    if (req.session.user.isAdmin === 1) {
      if (req.query.cpfUsuario) {
        connection.query(
          "SELECT * FROM projeto WHERE cpfUsuario=?",
          [req.query.cpfUsuario],
          (error, results, fields) => {
            if (error) {
              throw error;
            }
            res.json({
              isAuthenticated: true,
              email: req.session.user.email,
              isAdmin: req.session.user.isAdmin,
              results,
            });
          }
        );
      }
    } else {
      res.status(403).json({
        isAuthenticated: true,
        email: req.session.user.email,
        isAdmin: false,
      });
    }
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

app.put("/projeto", (req, res) => {
  if (req.session.user) {
    if (req.session.user.isAdmin === 1) {
      if (req.body.cpfUsuario && req.body.id) {
        connection.query(
          "UPDATE projeto SET nome=?, valorRecebidoTotal=?, valorRecebidoCapital=?, valorRecebidoCusteio=?, idEdital=? WHERE cpfUsuario=? AND id=?",
          [
            req.body.projetoNewInfo.nome,
            req.body.projetoNewInfo.valorRecebidoTotal,
            req.body.projetoNewInfo.valorRecebidoCapital,
            req.body.projetoNewInfo.valorRecebidoCusteio,
            req.body.projetoNewInfo.idEdital,
            req.body.cpfUsuario,
            req.body.id,
          ],
          (error, results, fields) => {
            if (error) {
              throw error;
            }
            res.status(200).send();
          }
        );
      }
    } else {
      res.status(403).json({
        isAuthenticated: true,
        email: req.session.user.email,
        isAdmin: false,
      });
    }
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

app.get("/edital", (req, res) => {
  connection.query("SELECT * FROM edital", (error, results, fields) => {
    if (error) {
      throw error;
    }
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
          results,
        });
      } else {
        res.status(403).json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: false,
        });
      }
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("userId", { path: "/" });
  res.status(200).send();
});

//403=logado mas nao admin
//401=nao logado

app.get("/login", (req, res) => {
  if (req.session.user) {
    if (req.session.user.isAdmin === 1) {
      res.json({
        isAuthenticated: true,
        email: req.session.user.email,
        isAdmin: req.session.user.isAdmin,
      });
    } else {
      res.status(403).json({
        isAuthenticated: true,
        email: req.session.user.email,
        isAdmin: false,
      });
    }
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

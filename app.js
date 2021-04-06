const cors = require("cors");

const express = require("express");
const app = express();
const port = 5000;

const mysql = require("mysql");

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

app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  connection.query(
    "SELECT * FROM usuario WHERE email=? AND senha=?",
    [req.body.email, req.body.password],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        console.log("existe");
        res.json(results);
      } else {
        console.log("nao existe");
        res.json({ message: "Credentials incorrect" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

//middleware setup
app.use(
  cors({
    origin: process.env.CLIENT,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
const auth = require("./routes/auth");
const projeto = require("./routes/projeto");
const usuario = require("./routes/usuario");
const edital = require("./routes/edital");

app.use("/auth", auth);

app.use("/usuario", usuario);

app.use("/projeto", projeto);

app.use("/edital", edital);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

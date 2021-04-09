require("dotenv").config();
const cors = require("cors");

const express = require("express");
const app = express();
const port = 5000;

const session = require("./session");

//middleware setup
app.use(
  cors({
    origin: process.env.CLIENT,
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//session store setup
const store = require("./db").sessionStore;
app.use(
  session({
    key: "userId",
    secret: "dijfoisdjfasf01923fi203fj92u3f09",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 365,
    },
    store: store,
  })
);

//database connection
// const connection = require("./db");

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

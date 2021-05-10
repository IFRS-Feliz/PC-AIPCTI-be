require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes/routes");

const express = require("express");
const sequelize = require("./services/db");
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
app.use(routes);

sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.log(`Couldn't connect to database, shutting down...`);
  });

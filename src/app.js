require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const express = require("express");
require("express-async-errors");
const sequelize = require("./db");
const app = express();
const port = process.env.PORT || 5000;

const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandling");

//middleware setup
app.use(
  cors({
    origin: process.env.CLIENT,
    credentials: true,
  })
);
app.use(express.json({ limit: process.env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use(routes);

//error handler
app.use(errorHandler);

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

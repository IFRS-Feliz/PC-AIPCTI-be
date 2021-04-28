require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes/routes");

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
app.use(routes);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

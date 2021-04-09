require("dotenv").config();
const mysql = require("mysql");
const session = require("./session");
var MySQLStore = require("express-mysql-session")(session);

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const storeOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const connection = mysql.createConnection(options);
const sessionStore = new MySQLStore(storeOptions, connection);

connection.connect((err) => {
  if (err) {
    console.log(err);
  }
});

module.exports = { connection: connection, sessionStore: sessionStore };

require("dotenv").config();
const mysql = require("mysql");

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const connection = mysql.createConnection(options);

connection.connect((err) => {
  if (err) {
    console.log(err);
  }
});

module.exports = connection;

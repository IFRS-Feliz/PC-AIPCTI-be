const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport(
  {
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  {
    from: '"DPPI - Prestação de contas" <dppi@feliz.ifrs.edu.br>',
    subject: "Credenciais",
  }
);

module.exports = transporter;

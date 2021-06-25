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

async function sendCreateUserMail(to, pass) {
  const url = process.env.URL;
  const email = await transporter.sendMail({
    to: to,
    html: `<h3>Olá,</h3>
           <p>Uma conta no sistema de prestação de contas do DPPI foi criada para você. Para acessar o sistema, utilize as credenciais a seguir em ${url}:</p>
           <p style="margin-bottom: 2px;"><strong>Email: </strong>${to}</p>
           <p style="margin-top: 0;"><strong>Senha: </strong>${pass}</p>
           <p style="margin-bottom: 2px;">Atenciosamente,</p>
           <p style="margin-top: 0;">DPPI</p>`,
  });
  return email;
}

async function sendPasswordResetMail(to, pass, adminReset = false) {
  const user = adminReset ? "O DDPI" : "Você";
  const email = await transporter.sendMail({
    to: to,
    html: `<h3>Olá,</h3>
           <p>${user} redefiniu sua senha no sistema de prestação de contas para o seguinte:</p>
           <p style="margin-bottom: 2px;"><strong>Email: </strong>${to}</p>
           <p style="margin-top: 0;"><strong>Senha: </strong>${pass}</p>
           <p style="margin-bottom: 2px;">Atenciosamente,</p>
           <p style="margin-top: 0;">DPPI</p>`,
  });
  return email;
}

module.exports = transporter;
module.exports.sendCreateUserMail = sendCreateUserMail;
module.exports.sendPasswordResetMail = sendPasswordResetMail;

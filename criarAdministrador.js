#! node

const sequelize = require("./src/db");
const User = sequelize.models["User"];
const { generatePasswordHash } = require("./src/controllers/UserController");

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Criação do administrador inicial: \n");
rl.question("Nome (para display no sistema): ", (answer) => {
  const nome = answer;

  rl.question("Email (para login): ", async (answer) => {
    const email = answer.trim();

    const isDuplicate = await User.findAll({ where: { email } });
    if (isDuplicate && isDuplicate.length) {
      console.log("Email em uso por outro usuário, abortando...");
      rl.close();
    }

    rl.question("Senha: ", async (answer) => {
      const senha = answer;

      const hash = await generatePasswordHash(senha);

      rl.question(
        "CPF (não pode ser vazio, pode ser qualquer caracter, é a PK do usuario): ",
        async (answer) => {
          const cpf = answer.trim();

          if (!cpf) {
            console.log(
              "CPF deve ter ao menos 1 catactere (é necessário para que o administrador possa mudar de senha no futuro por meio do sistema)"
            );
          }

          const isDuplicate = await User.findByPk(cpf);
          if (isDuplicate) {
            console.log("CPF em uso por outro usuário, abortando...");
            rl.close();
          }

          let user = {
            email,
            senha,
            nome,
            isAdmin: true,
            cpf,
          };
          console.log("O usuário criado será o seguinte: ", user);
          rl.question("Criar? (s/n) ", async (answer) => {
            answer = answer.toLowerCase().trim();

            if (answer !== "n") {
              try {
                user.senha = hash;
                user = await User.create(user);
                console.log("Administrador criado");
                rl.close();
              } catch (error) {
                console.log(
                  "Erro ao criar o administrador, abortando...",
                  error
                );
                rl.close();
              }
            }
            console.log("Criação abortada");
            rl.close();
          });
        }
      );
    });
  });
});

rl.on("close", () => {
  console.log("Terminando...");
  process.exit(0);
});

# Sistema de auxílio a prestação de contas

### Para rodar no seu computador:

Basta clonar o repositório, configurar as variáveis de ambiente e executar o comando `yarn dev`.

### Para rodar em produção:

Clone o repositório, configure as variáveis de ambiente (`NODE_ENV` deve ser `production`) e execute `yarn start`. 


### Front-end:

Este projeto serve a aplicação disponível em [PC-AIPCTI-fe](https://github.com/IFRS-Feliz/PC-AIPCTI-fe).


### Varáveis de ambiente requisitadas:

| Key                 | Value                                     |
| ------------------- | ----------------------------------------- |
| PORT                | Porta (padrão=5000)                       |
| CLIENT              | URL do front-end (para setar CORS)        |
| DB_HOST             | URL do BD                                 |
| DB_USER             | Usuário para autenticação do BD           |
| DB_PASSWORD         | Senha para autenticação do DB             |
| DB_DATABASE         | Nome do DB                                |
| SECRET              | Secret para geração de tokens JWT         |
| REFRESH_SECRET      | Secret para geração de refresh tokens JWT |
| EMAIL_USER          | Email para envios automáticos             |
| EMAIL_PASS          | Senha para o email                        |
| EMAIL_HOST          | URL do host do email                      |
| URL                 | URL do front-end utilizado em emails      |
| BODY_LIMIT          | Tamanho máximo de arquivos para upload    |
| NODE_ENV            | `production` ou `development`             |

As variáveis de ambiente podem ser setadas em um arquivo `.env` na raíz do projeto.


### Contribuir

Sinta-se livre para criar issues e pull requests ou enviar uma mensagem para os contribuidores atuais.

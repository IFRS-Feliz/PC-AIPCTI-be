const jwt = require("jsonwebtoken");

function auth(adminOnly) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"]; //Bearer token
    let token = authHeader && authHeader.split(" ")[1]; //token

    const refreshToken = req.cookies.refreshToken;

    jwt.verify(token, process.env.SECRET, (error, user) => {
      if (error) {
        if (refreshToken) {
          //futuramente verificar se refreshToken esta no db
          jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET,
            (errorR, userR) => {
              if (errorR) return res.sendStatus(401);

              const newUser = {
                name: userR.name,
                cpf: userR.cpf,
                email: userR.email,
                isAdmin: userR.isAdmin,
              };

              token = jwt.sign(newUser, process.env.SECRET, {
                expiresIn: "10s",
              });

              user = userR;
            }
          );
        } else return res.sendStatus(401);
      }

      if (user.isAdmin === 0 && adminOnly) return res.sendStatus(403);

      req.token = token;
      req.user = user;
      next();
    });
  };
}

module.exports = { auth };

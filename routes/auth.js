const express = require("express");
const router = express.Router();

const connection = require("../db").connection;

router
  .route("/login")
  .get((req, res) => {
    if (req.session.user) {
      if (req.session.user.isAdmin === 1) {
        res.json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: req.session.user.isAdmin,
        });
      } else {
        res.status(403).json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: false,
        });
      }
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  })
  .post((req, res) => {
    connection.query(
      "SELECT * FROM usuario WHERE email=? AND senha=?",
      [req.body.email, req.body.password],
      (error, results, fields) => {
        if (error) {
          throw error;
        }
        if (results.length > 0) {
          req.session.user = results[0];
          res.json({
            isAuthenticated: true,
            email: req.session.user.email,
            isAdmin: req.session.user.isAdmin,
          });
        } else {
          res.status(401).json({ isAuthenticated: false });
        }
      }
    );
  });

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.clearCookie("userId", { path: "/" });
  res.status(200).send();
});

module.exports = router;

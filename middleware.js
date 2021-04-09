function auth(adminOnly) {
  return (req, res, next) => {
    if (req.session.user) {
      if (adminOnly && req.session.user.isAdmin !== 1) {
        res.status(403).json({
          isAuthenticated: true,
          email: req.session.user.email,
          isAdmin: false,
        });
        return;
      }
    } else {
      res.status(401).json({ isAuthenticated: false });
      return;
    }
    next();
  };
}

module.exports = { auth };

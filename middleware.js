module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveReturnTo = (req, res, next) => {
  if (req.session.redirectUrl) {
      res.locals.returnTo = req.session.redirectUrl;
  }
  next();
}
const express = require("express");
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { saveReturnTo } = require("../middleware.js");
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


router.get('/signup', (req, res) => {
  res.render('design/signup.ejs');
});

router.get('/login', (req, res) => {
  res.render('design/login.ejs');
});

router.post('/signup', async (req, res) => {
  const { username, type, email, password } = req.body;
  if (!username || !password) {
    req.flash('error', 'Username and password are required.');
    return res.redirect('/signup');
  }

  const newuser = new User({ email, type, username });
  const registeredUser = await User.register(newuser, password);
  console.log(registeredUser);
  req.login(registeredUser, (err) => {
    if (err) {
      console.log(err);
    }
    req.flash("success", "Welcome to Blogify!");
    res.redirect('/blog');
  });
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

router.post('/login', async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username });

  if (user && user.googleId && !user.hash) {
    req.flash("error", "You registered using Google. Use 'Login with Google' instead.");
    return res.redirect('/login');
  }

  passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password'
  })(req, res, () => {
    req.flash("success", "Welcome back");
    res.redirect("/blog");
  });
});


router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in first.");
    return res.redirect("/login");
  }
  res.redirect("/blog");
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect('/blog');
  });
});


module.exports = router;
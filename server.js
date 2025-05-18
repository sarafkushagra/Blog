require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Add middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set('view engine', 'ejs');

const sessionOptions = {
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionOptions));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},(accesstoken, refreshToken, profile, done) => {
  return done(null, profile);
}
)
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
}); 

app.get("/poke", (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`);
});

app.get("/logou", (req, res) => {
  req.logout(() => {
    res.redirect("/poke");
  });
});

// Add signup route handler
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password, type } = req.body;
    console.log('Signup data:', { username, email, type }); // For debugging
    
    // TODO: Add your user creation logic here
    // For now, just redirect to signin page
    res.redirect('/signin');
  } catch (error) {
    console.error('Signup error:', error);
    res.redirect('/signup');
  }
});

app.listen(3000, () => {
  console.log(`Server is running on 3000`);
});
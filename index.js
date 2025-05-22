require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require("path");
const ejsMate = require('ejs-mate');
const Mongostore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");
const wrapAsync = require("./utils/wrapAsync.js");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {isLoggedIn} = require('./middleware');
// EJS configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware - Order is important!
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Serve static files first
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

const port = 3000;

// Connect to MongoDB
const MONGO_URL = "mongodb://127.0.0.1:27017/blogify";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "mysupersecret",
  resave: false,
  saveUninitialized: true,
  store: Mongostore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 60 * 60 // time period in seconds
  }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//Middleware to set flash messages and user
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Error handling middleware for invalid ObjectIds
app.use((err, req, res, next) => {
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        req.flash('error', 'Invalid blog ID');
        return res.redirect('/blog');
    }
    next(err);
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('pages/home');
});

app.get('/archive', isLoggedIn, (req, res) => {
  res.send('hello archive');
}
);

const blogs = require('./routers/blog');
app.use("/", blogs);

const userData = require('./routers/userdata');
app.use("/", userData);

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) return done(null, existingUser);

    const newUser = new User({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      type: "google"
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
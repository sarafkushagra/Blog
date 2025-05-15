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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.redirect('/blog');
});

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
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

 
//Middleware to set flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use((req,res,next,err)=>{
  res.send("Something went wrong");
})

const blogs = require('./routers/blog');
app.use("/", blogs);

const userData = require('./routers/userdata');
app.use("/", userData);

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

    await newUser.save(); // <-- No need for User.register
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


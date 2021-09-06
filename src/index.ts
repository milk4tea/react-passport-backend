import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import User from "./User";
import { IMongoDBUser } from './types';


const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const GitHubStrategy = require("passport-github").Strategy;

dotenv.config();

const app = express();

mongoose.connect(
  `${process.env.START_MONGODB}${process.env.USERNAME_MONGODB}:${process.env.PASSWORD_MONGODB}${process.env.END_MONGODB}`,
  {},
  () => {
    console.log("Connected to mongoose successfuly");
  }
);

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: IMongoDBUser, done: any) => {
   done(null, user._id);
});

passport.deserializeUser((id: String, done: any) => {
  User.findById(id, (err: Error, user: IMongoDBUser) => {      
      done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (_:any, __:any, profile: any, cb: any) {
      User.findOne({ googleId: profile.id}, async (err: Error, doc: IMongoDBUser) => {
          if(err) {
              cb(err, null);
          }

          if(!doc) {
              // create one
              const newUser = new User({
                  googleId: profile.id,
                  username: profile.name.givenName
              });
              await newUser.save();
              cb(null, newUser);
          }
          cb(null, doc);
      })

    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/auth/twitter/callback",
    },
    function (_:any, __:any, profile: any, cb: any) {
        User.findOne({ twitterId: profile.id}, async (err: Error, doc: IMongoDBUser) => {
            if(err) {
                cb(err, null);
            }
  
            if(!doc) {
                // create one
                const newUser = new User({
                    twitterId: profile.id,
                    username: profile.username
                });
                await newUser.save();
                cb(null, newUser);
            }

            cb(null, doc);
        })        
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: `${process.env.GITHUB_CLIENT_ID}`,
      clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
      callbackURL: "/auth/github/callback",
    },
    function (_:any, __:any, profile: any, cb: any) {
        User.findOne({ githubId: profile.id}, async (err: Error, doc: IMongoDBUser) => {
            if(err) {
                cb(err, null);
            }
  
            if(!doc) {
                // create one
                const newUser = new User({
                    githubId: profile.id,
                    username: profile.username
                });
                await newUser.save();
                cb(null, newUser);
            }
            cb(null, doc);
        })    
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

app.get("/auth/github", passport.authenticate("github"));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/getuser", (req, res) => {
  res.send(req.user);
});

app.get("/auth/logout", (req, res) => {
    if(req.isAuthenticated()) {
        req.logout();
        res.send("done");
    }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server Started");
});

import passport from "passport";
import local from "passport-local";
import userModel from "../dao/models/usersModel.js";
import GitHubStrategy from "passport-github2";
import GoogleStrategy from "passport-google-oauth2";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID:
          "1025051089040-fbuvg20hhn8q3mcl3bcr8p4bd8pv7e1a.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:8080/session/googlecallback",
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        console.log(profile);
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) {
            console.log("User already exits");
            return done(null, user);
          }

          const newUser = {
            name: profile._json.given_name,
            lastName: profile._json.family_name,
            user:profile._json.given_name,
            email: profile._json.email,
            password: "",
          };
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("error to login with github" + error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "cd7f774ebdec3386da7a",
        clientSecret: "8e0b6396b8c95fd3bb47a0cce4357a64ca58ba96",
        callbackURL: "http://localhost:8080/session/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {

        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) {
            console.log("User already exits");
            return done(null, user);
          }

          const newUser = {
            user: profile._json.name,
            name: profile._json.name,
            last_name: "",
            email: profile._json.email,
            password: "",
          };
          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("error to login with github" + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await userModel
            .findOne({ email: username })
            .lean()
            .exec();
          if (!user) {
            return done(null, false);
          }
          if (!isValidPassword(user, password)) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        let userNew = req.body;
        try {
          const user = await userModel.findOne({ email: username });

          if (user) {
            console.log("Usuario Existente");
            return done(null, false);
          }
          if (
            userNew.email.includes(`_admin`) &&
            userNew.password == "SoyAdminPapa"
          ) {
            let asignarRol = {
              ...userNew,
              rol: "admin",
            };
            userNew = asignarRol;
          } else {
            let asignarRol = {
              ...userNew,
              rol: "user",
            };
            userNew = asignarRol;
          }
          const hashUser = {
            ...userNew,
            password: createHash(userNew.password),
          };
          const result = await userModel.create(hashUser);
          return done(null, result);
        } catch (error) {
          return done("Error al obtener usuario");
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;

import { Router } from "express";
import session from "express-session";
import passport from "passport";
import userModel from "../dao/models/usersModel.js";

const router = Router();

router.get(`/login`, (req, res) => {
  res.render(`login`, {
    style: "sessions.css",
  });
});

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/session/faillogin" }),
  async (req, res) => {
    // const { email, password } = req.body;
    // const newUser = await userModel.findOne({ email, password }).lean().exec();
    if (!req.user) {
      return res.status(400);
    }
    req.session.user = req.user;
    console.log(req.user);
    res.redirect("/products");
  }
);

router.get("/faillogin", (req, res) => {
  res.status(401).render("login", {
    error: "Usuario y/o contraseña incorrecta",
    style: "sessions.css",
  });
});

router.get(`/register`, (req, res) => {
  res.render(`register`, {
    style: "register.css",
  });
});
router.post(
  "/createUser",
  passport.authenticate("register", {
    failureRedirect: "/session/failregister",
  }),
  async (req, res) => {
    // const userNew = req.body;
    // if (userNew.email.includes(`_admin`) && userNew.password == "SoyAdminPapa") {
    //   let adminUserNew = {
    //     ...userNew,
    //     rol: "admin",
    //   };
    //   const user = new userModel(adminUserNew);
    // //   await user.save();
    //   return res.redirect("/session/login");
    // }
    // let newUser = {
    //   ...userNew,
    //   rol: "user",
    // };
    // const user = new userModel(newUser);
    // await user.save();
    res.redirect("/session/login");
  }
);
router.get("/failregister", (req, res) => {
  res.status(400).render("register", {
    error: "Email ya registrado, coloca otro email",
    style: "register.css",
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
  (req, res) => {}
);

router.get(
  "/googlecallback",
  passport.authenticate("google", { failureRedirect: "/session/login" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
  }
);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["email"] }),
  (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/session/login" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
  }
);

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).render("error", { mensaje: err });
    } else res.redirect("/session/login");
  });
});

export default router;
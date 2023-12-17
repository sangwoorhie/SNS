const express = require("express");
const passport = require("passport");
const sendMail = require("../mail/mail");
const User = require("../models/users.model");
const usersRouter = express.Router();

// 로컬에서 로그인 localhost:4000/auth/login
usersRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.json({ msg: info });
    }

    req.logIn(user, function (error) {
      if (error) {
        return next(error);
      }
      res.redirect("/");
    });
  })(req, res, next);
});

// 로그아웃 localhost:4000/auth/logout
usersRouter.post("/logout", (req, res, next) => {
  req.logOut(function (error) {
    if (error) {
      return next(error);
    }
    res.redirect("/login");
  });
});

// 회원가입 localhost:4000/auth/signup
usersRouter.post("/signup", async (req, res) => {
  // user 객체를 생성 수 user컬렉션에 유저 저장
  const user = new User(req.body);

  try {
    await user.save();
    // sendMail("johnahn@example.com", "John Ahn", "welcome"); // 이메일 보내기
    res.redirect("/login");
  } catch (error) {
    console.error(error);
  }
});

// 구글 로그인 localhost:4000/auth/google
// https://myaccount.google.com/security
usersRouter.get("/google", passport.authenticate("google"));

usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

// 카카오 로그인 localhost:4000/auth/kakao
usersRouter.get("/kakao", passport.authenticate("kakao"));

usersRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = usersRouter;

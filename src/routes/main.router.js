const express = require("express");
const mainRouter = express.Router();
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middleware/auth");

// 메인화면
mainRouter.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});

// 로그인
mainRouter.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

// 회원가입
mainRouter.get("/signup", checkNotAuthenticated, (req, res) => {
  res.render("signup");
});

module.exports = mainRouter;

const express = require("express");
const { checkAuthenticated, checkIsMe } = require("../middleware/auth");
const profilesRouter = express.Router({
  mergeParams: true,
});
const Post = require("../models/posts.models");
const User = require("../models/users.model");

// 프로필 조회
profilesRouter.get("/", checkAuthenticated, (req, res) => {
  Post.find({ "author.id": req.params.id })
    .populate("comments")
    .sort({ createdAt: -1 })
    .exec((error, posts) => {
      if (error) {
        req.flash("error", "게시물을 가져오는데 실패했습니다.");
        res.redirect("back");
      } else {
        User.findById(req.params.id, (error, user) => {
          if (error || !user) {
            req.flash("error", "없는 유저 입니다.");
            res.redirect("back");
          } else {
            res.render("profile", {
              posts: posts,
              user: user,
            });
          }
        });
      }
    });
});

profilesRouter.get("/edit", checkIsMe, (req, res) => {
  res.render("profile/edit", {
    user: req.user,
  });
});

// 프로필 수정
profilesRouter.put("/", checkIsMe, (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, (error, user) => {
    if (error || !user) {
      req.flash("error", "유저 데이터를 업데이트하는데 에러가 났습니다.");
      res.redirect("back");
    } else {
      req.flash("success", "유저 데이터를 업데이트하는데 성공했습니다.");
      res.redirect("/profile/" + req.params.id);
    }
  });
});

module.exports = profilesRouter;

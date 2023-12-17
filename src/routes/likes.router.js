const express = require("express");
const { checkAuthenticated } = require("../middleware/auth");
const likesRouter = express.Router();
const Post = require("../models/posts.models");

// 좋아요 생성
likesRouter.put("/posts/:id/like", checkAuthenticated, (req, res) => {
  Post.findById(req.params.id, (error, post) => {
    if (error || !post) {
      req.flash("error", "포스트를 찾지 못했습니다.");
      res.redirect("back");
    } else {
      // 이미 누른 좋아요
      if (post.likes.find((like) => like === req.user._id.toString())) {
        const updatedLikes = post.likes.filter(
          (like) => like !== req.user._id.toString()
        );
        // ['wpkfowkeokfwe']
        Post.findByIdAndUpdate(
          post._id,
          {
            likes: updatedLikes,
          },
          (error, _) => {
            if (error) {
              req.flash(
                "error",
                "좋아요를 업데이트하는데 에러가 발생했습니다."
              );
              res.redirect("back");
            } else {
              req.flash("success", "좋아요를 업데이트 했습니다.");
              res.redirect("back");
            }
          }
        );
      }
      // 처음 누른 좋아요
      else {
        Post.findByIdAndUpdate(
          post._id,
          {
            likes: post.likes.concat([req.user._id]),
          },
          (error, _) => {
            if (error) {
              req.flash(
                "error",
                "좋아요를 업데이트하는데 에러가 발생했습니다."
              );
              res.redirect("back");
            } else {
              req.flash("success", "좋아요를 업데이트 했습니다.");
              res.redirect("back");
            }
          }
        );
      }
    }
  });
});

module.exports = likesRouter;

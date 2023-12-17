const Post = require("../models/posts.models");
const Comment = require("../models/comments.models");
const User = require("../models/users.model");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/posts");
  }
  next();
}

function checkPostOwnerShip(req, res, next) {
  if (req.isAuthenticated()) {
    // id에 맞는 포스트가 있는 포스트인지
    Post.findById(req.params.id, (error, post) => {
      if (error || !post) {
        req.flash("error", "포스트가 없거나 에러가 발생했습니다.");
        res.redirect("back");
      } else {
        // 포스트가 있는데 나의 포스트인지 확인
        if (post.author.id.equals(req.user._id)) {
          req.post = post;
          next();
        } else {
          req.flash("error", "권한이 없습니다.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "로그인을 먼저 해주세요.");
    res.redirect("/login");
  }
}

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.commentId, (error, comment) => {
      if (error || !comment) {
        req.flash("error", "댓글을 찾는 도중에 에러가 발생했습니다.");
        res.redirect("back");
      } else {
        // 내가 작성한 댓글인지 확인
        if (comment.author.id.equals(req.user._id)) {
          req.comment = comment;
          next();
        } else {
          req.flash("error", "권한이 없습니다.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "로그인을 해주세요.");
    res.redirect("/login");
  }
}

function checkIsMe(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, (error, user) => {
      if (error || !user) {
        req.flash("error", "유저를 찾는데 에러가 발생했습니다.");
        res.redirect("/profile/" + req.params.id);
      } else {
        if (user._id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "권한이 없습니다.");
          res.redirect("/profile/" + req.params.id);
        }
      }
    });
  } else {
    req.flash("error", "먼저 로그인을 해주세요.");
    res.redirect("/login");
  }
}

module.exports = {
  checkIsMe,
  checkCommentOwnership,
  checkPostOwnerShip,
  checkAuthenticated,
  checkNotAuthenticated,
};

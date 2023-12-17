const express = require("express");
const multer = require("multer");
const {
  checkAuthenticated,
  checkPostOwnerShip,
} = require("../middleware/auth");
const Comment = require("../models/comments.models");
const Post = require("../models/posts.models");
const postsRouter = express.Router();
const path = require("path");

const storageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "../public/assets/images"));
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storageEngine }).single("image");

// 게시글 생성
postsRouter.post("/", checkAuthenticated, upload, (req, res, next) => {
  let desc = req.body.desc;
  let image = req.file ? req.file.filename : "";

  Post.create(
    {
      image: image,
      description: desc,
      author: {
        id: req.user._id,
        username: req.user.username,
      },
    },
    (error, _) => {
      if (error) {
        req.flash("error", "포스트 생성 실패");
        res.redirect("back");

        // next(error);
      } else {
        req.flash("success", "포스트 생성 성공");
        res.redirect("back");
      }
    }
  );
});

// 게시글 조회
postsRouter.get("/", checkAuthenticated, (req, res) => {
  Post.find()
    .populate("comments")
    .sort({ createdAt: -1 })
    .exec((error, posts) => {
      if (error) {
        console.log(error);
      } else {
        res.render("posts", {
          posts: posts,
        });
      }
    });
});

postsRouter.get("/:id/edit", checkPostOwnerShip, (req, res) => {
  res.render("posts/edit", {
    post: req.post,
  });
});

// 게시글 수정
postsRouter.put("/:id", checkPostOwnerShip, (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body, (error, _) => {
    if (error) {
      req.flash("error", "게시물을 수정하는데 오류가 발생했습니다.");
      res.redirect("/posts");
    } else {
      req.flash("success", "게시물 수정을 완료했습니다.");
      res.redirect("/posts");
    }
  });
});

// 게시글 삭제
postsRouter.delete("/:id", checkPostOwnerShip, (req, res) => {
  Post.findByIdAndDelete(req.params.id, (error, _) => {
    if (error) {
      req.flash("error", "게시물을 지우는데 실패했습니다.");
    } else {
      req.flash("success", "게시물을 지우는데 성공했습니다.");
    }
    res.redirect("/posts");
  });
});

module.exports = postsRouter;

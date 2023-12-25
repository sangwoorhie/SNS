const express = require("express");
const { checkAuthenticated } = require("../middleware/auth");
const User = require("../models/users.model");
const friendsRouter = express.Router();

// 친구 조회
friendsRouter.get("/", checkAuthenticated, (req, res) => {
  User.find({}, (error, users) => {
    if (error) {
      req.flash("error", "유저를 가져오는데 에러가 발생했습니다.");
      res.redirect("/posts");
    } else {
      res.render("friends", {
        users: users,
      });
    }
  });
});

// 친구 추가
friendsRouter.put("/:id/add-friend", checkAuthenticated, (req, res) => {
  User.findById(req.params.id, (error, user) => {
    if (error || !user) {
      req.flash("error", "유저를 찾지 못했습니다.");
      res.redirect("/friends");
    } else {
      console.log("req.user._id", [req.user._id]);
      User.findByIdAndUpdate(
        user._id,
        {
          friendsRequests: user.friendsRequests.concat([req.user._id]),
        },
        (error, _) => {
          if (error) {
            res.redirect("back");
          } else {
            res.redirect("back");
          }
        }
      );
    }
  });
});

// 친구요청 삭제
friendsRouter.put(
  "/:firstId/remove-friend-request/:secondId",
  checkAuthenticated,
  (req, res) => {
    User.findById(req.params.firstId, (error, user) => {
      if (error || !user) {
        req.flash("error", "유저를 찾지 못했습니다.");
        res.redirect("back");
      } else {
        const filteredFriendsRequests = user.friendsRequests.filter(
          (friendId) => friendId !== req.params.secondId
        );
        User.findByIdAndUpdate(
          user._id,
          {
            friendsRequests: filteredFriendsRequests,
          },
          (error, _) => {
            if (error) {
              req.flash("error", "친구 요청 취소를 하는데 에러가 났습니다.");
            } else {
              req.flash("success", "친구 요청 취소를 성공했습니다.");
            }
            res.redirect("back");
          }
        );
      }
    });
  }
);

// 친구요청 수락
friendsRouter.put(
  "/:id/accept-friend-request",
  checkAuthenticated,
  (req, res) => {
    User.findById(req.params.id, (error, senderUser) => {
      if (error || !senderUser) {
        req.flash("error", "유저를 찾지 못했습니다.");
        res.redirect("back");
      } else {
        User.findByIdAndUpdate(
          senderUser._id,
          {
            friends: senderUser.friends.concat([req.user._id]),
          },
          (error, _) => {
            if (error) {
              req.flash("error", "친구 추가에 실패했습니다.");
              res.redirect("back");
            } else {
              User.findByIdAndUpdate(
                req.user._id,
                {
                  friends: req.user.friends.concat([senderUser._id]),
                  friendsRequests: req.user.friendsRequests.filter(
                    (friendId) => friendId !== senderUser._id.toString()
                  ),
                },
                (error, _) => {
                  if (error) {
                    req.flash("error", "친구 추가에 실패했습니다.");
                    res.redirect("back");
                  } else {
                    req.flash("success", "친구 추가에 성공했습니다.");
                    res.redirect("back");
                  }
                }
              );
            }
          }
        );
      }
    });
  }
);

// 친구 삭제
friendsRouter.put("/:id/remove-friend", checkAuthenticated, (req, res) => {
  User.findById(req.params.id, (error, user) => {
    if (error || !user) {
      req.flash("error", "유저 찾기에 실패했습니다.");
      res.redirect("back");
    } else {
      User.findByIdAndUpdate(
        user._id,
        {
          friends: user.friends.filter(
            (friendId) => friendId !== req.user._id.toString()
          ),
        },
        (error, _) => {
          if (error) {
            req.flash("error", "친구 삭제에 실패했습니다.");
            res.redirect("back");
          } else {
            User.findByIdAndUpdate(
              req.user._id,
              {
                friends: req.user.friends.filter(
                  (friendId) => friendId !== req.params.id.toString()
                ),
              },
              (error, _) => {
                if (error) {
                  req.flash("error", "친구 삭제에 실패했습니다.");
                } else {
                  req.flash("success", "친구 삭제에 성공했습니다.");
                }
                res.redirect("back");
              }
            );
          }
        }
      );
    }
  });
});

module.exports = friendsRouter;

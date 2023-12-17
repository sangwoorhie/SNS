const cookieSession = require("cookie-session");
const express = require("express");
const { default: mongoose } = require("mongoose");
const passport = require("passport");
const app = express();
const path = require("path");

//Routers
const mainRouter = require("./routes/main.router");
const usersRouter = require("./routes/users.router");
const commentsRouter = require("./routes/comments.router");
const friendsRouter = require("./routes/friends.router");
const likesRouter = require("./routes/likes.router");
const postsRouter = require("./routes/posts.router");
const profilesRouter = require("./routes/profiles.router");

const config = require("config");
const serverConfig = config.get("server");

const port = serverConfig.port;

require("dotenv").config();

app.use(
  cookieSession({
    name: "cookie-session-name",
    keys: [process.env.COOKIE_ENCRYPTION_KEY],
  })
);

// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/static", express.static(path.join(__dirname, "../public")));

// Routers
app.use("/", mainRouter);
app.use("/auth", usersRouter);
app.use("/posts", postsRouter);
app.use("/posts/:id/comments", commentsRouter);
app.use("/posts/:id/likes", likesRouter);
app.use("/friends", friendsRouter);
app.use("/profile/:id", profilesRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

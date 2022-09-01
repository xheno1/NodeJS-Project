const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const nocache = require("nocache");
const cors = require('cors')

const app = express();

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users-routes");
const loginRouter = require("./routes/login-routes");
const registerRouter = require("./routes/register-routes");
const chatRouter = require("./routes/chat-routes");
const userListRouter = require("./routes/users-list-routes");
const docsListRouter = require("./routes/docs-list-routes");
const logoutRouter =  require("./routes/logout-routes");

// Set to  production or dev
app.set("env", "production")

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(nocache());
app.use(cors())

// Mounting Routes
app.use("/", indexRouter); // welcome page
app.use("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/chats", chatRouter);
app.use("/user-list", userListRouter);
app.use("/docs-list", docsListRouter);
app.use("/logout", logoutRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

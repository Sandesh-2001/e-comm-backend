const express = require("express");
const shopAuthRoutes = require("./routes/shopAuthRoutes");
const userRoutes = require("./routes/userRouter");
const emailRoutes = require("./routes/emailRoute");
const path = require("path");
const bodyParser = require("body-parser");
const errorHandler = require("./controllers/errorController");

const CustomError = require("./utils/customErrorHandler");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
//We need to add this lines to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("./public"));

app.use(express.json());

app.use("/auth", shopAuthRoutes);
app.use("/users", userRoutes);
app.use("/emails", emailRoutes);

app.all("*", (req, res, next) => {
  const error = new CustomError(`The URL ${req.originalUrl} is not found`, 404);
  next(error);
});
app.use(errorHandler);

module.exports = app;

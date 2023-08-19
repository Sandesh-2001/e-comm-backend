const express = require("express");
const shopAuthRoutes = require("./routes/shopAuthRoutes");
const userRoutes = require("./routes/userRouter");
const errorHandler = require("./controllers/errorController");

const CustomError = require("./utils/customErrorHandler");

const app = express();

app.use(express.json());

app.use("/auth", shopAuthRoutes);
app.use("/users", userRoutes);

app.all("*", (req, res, next) => {
  const error = new CustomError(`The URL ${req.originalUrl} is not found`, 404);
  next(error);
});
app.use(errorHandler);

module.exports = app;

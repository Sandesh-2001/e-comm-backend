const express = require("express");
const dotevn = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");
dotevn.config({ path: "./config.env" });

mongoose
  .connect(process.env.LOCAL_CONN_STR, {
    useNewUrlParser: true,
    dbName: "E-comm-backend-new",
  })
  .then((conn) => {
    console.log("DB connection success...");
  });

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on ${process.env.PORT}...`);
});

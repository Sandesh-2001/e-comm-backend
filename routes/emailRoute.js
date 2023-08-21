const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").get(function (req, res) {
  res.render("templates/emailLogin");

  //   console.log("email is" + req.body.data);
  //   res.render;
});

router.post("/login-email", authController.verifyLogin);

router.get("/view/:id", authController.emailContent);

module.exports = router;

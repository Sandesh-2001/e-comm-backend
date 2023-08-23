const express = require("express");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(function (req, res) {
    res.render("templates/emailLogin");
  })
  .post(authController.verifyLogin, authController.emailHomeGet);

router
  .route("/:email")
  .get(authController.verifyLogin, authController.emailHomeGet);

router.get("/view/:id", authController.emailContent);

module.exports = router;

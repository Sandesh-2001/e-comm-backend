const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/self").get(authController.verifyToken, authController.self);
module.exports = router;
const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login/google", authController.loginWithGoogle);
router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/self").get(authController.verifyToken, authController.self);
router
  .route("/change-password")
  .post(authController.verifyToken, authController.changePassword);

router.route("/forgot-password").post(authController.forgotPassword);

router
  .route("/reset-password")
  .post(authController.verifyToken, authController.resetPassword);

router.post(
  "/send-verification-email",
  authController.verifyToken,
  authController.sendVerificationEmail
);
router.post(
  "/verify-email",
  authController.verifyToken,
  authController.verifyEmail
);

module.exports = router;

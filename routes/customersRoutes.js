const express = require("express");
const shopCustomerController = require("./../controllers/shopCustomerController");
const multer = require("multer");
const path = require("path");
const authController = require("./../controllers/authController");

const router = express.Router();

// router.use("/profile_img", express.static("/upload/profile_img"));
router.use("/", express.static("upload/profile_img"));
const storage = multer.diskStorage({
  destination: "upload/profile_img",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
  limits: 10000000,
});

router.patch(
  "/update-profile",
  authController.verifyToken,
  shopCustomerController.updateCustomerProfile
);
router
  .route("/profile-picture")
  .post(
    authController.verifyToken,
    upload.single("picture", 1),
    shopCustomerController.updateCustomerPicture
  )
  .delete(
    authController.verifyToken,
    shopCustomerController.deleteProfilePicture
  );

router
  .route("/address")
  .get(authController.verifyToken, shopCustomerController.getSavedAddress)
  .post(authController.verifyToken, shopCustomerController.addAddress);

router
  .route("/address/:addressId")
  .delete(authController.verifyToken, shopCustomerController.deleteAddress)
  .put(authController.verifyToken, shopCustomerController.updateAddress);

router.post(
  "/auth/change-password",
  authController.verifyToken,
  shopCustomerController.changePassword
);

router.delete(
  "/account",
  authController.verifyToken,
  shopCustomerController.deleteAccount
);

module.exports = router;

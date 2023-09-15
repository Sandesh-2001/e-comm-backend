const express = require("express");
const usersController = require("./../controllers/usersController");
const authController = require("./../controllers/authController");
const router = express.Router();
router.use(express.json());
router.use(authController.verifyToken);

router
  .route("/")
  .post(usersController.createUser)
  .get(usersController.getAllUsers);

router
  .route("/org")
  .patch(usersController.updateCompanyInfo)
  .get(usersController.getOrg);

router
  .route("/:userId")
  .patch(usersController.updateUserInfo)
  .delete(usersController.deleteUser);
router.route("/role/:userId").patch(usersController.updateRole);

module.exports = router;

const express = require("express");
const authController = require("./../controllers/authController");
const router = express.Router();
const shopSideController = require("./../controllers/shopSideController");
const orderRoutes = require("./../routes/shopOrdersRoutes");

router.use("/orders", orderRoutes);
router.get("/orders/invoice-pdf", function (req, res) {
  res.sendFile(__dirname + "/my-invoice.pdf");
});

router.post("/auth/login/google", shopSideController.signInWithGoogle);
router.route("/products").get(shopSideController.getAllProducts);
router.post("/auth/register", shopSideController.customerRegistration);
router.post("/auth/login", shopSideController.customerLogin);
router.get(
  "/auth/self",
  authController.verifyToken,
  shopSideController.customerSelf
);

module.exports = router;

const express = require("express");
const sellerOrderController = require("./../controllers/sellerOrderController.js");
const authController = require("./../controllers/authController");
const router = express.Router(authController.verifyToken);
router.use(authController.verifyToken);
router.get("/", sellerOrderController.getAllOrders);
router.get("/:orderId", sellerOrderController.getSpecificOrder);
router.patch("/:action/:orderId", sellerOrderController.orderAction);

module.exports = router;

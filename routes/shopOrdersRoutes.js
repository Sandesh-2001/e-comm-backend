const express = require("express");
const orderControllers = require("./../controllers/shopOrderController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.use(authController.verifyToken);
router
  .route("/")
  .post(orderControllers.createOrder)
  .get(orderControllers.getAllOrders);

router.get("/:orderId", orderControllers.getSpecificOrder);

router.patch("/cancel/:orderId", orderControllers.cancelOrder);

router.put("/confirm/:orderId", orderControllers.makePayment);

router.post("/invoice-pdf/:orderId", orderControllers.orderInvoice);

module.exports = router;

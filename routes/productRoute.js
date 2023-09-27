const path = require("path");
const express = require("express");
const authController = require("./../controllers/authController");
const multer = require("multer");
const router = express.Router();
router.use("/product-img", express.static("upload/product_img"));
router.use(express.json());

router.use("/", express.static("upload/product_img"));
router.use(express.json());
const storage = multer.diskStorage({
  destination: "./upload/product_img",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${Math.random()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 },
});

const productController = require("./../controllers/productController");

router.post(
  "/add-deal/:productId",
  authController.verifyToken,
  productController.addDeal
);

router.delete(
  "/remove-deal",
  authController.verifyToken,
  productController.removeDeal
);

router.get(
  "/get-category-details",
  authController.verifyToken,
  productController.getDashboard
);

router
  .route("/")
  .post(
    authController.verifyToken,
    upload.array("images", 20),
    productController.createProduct
  )
  .get(authController.verifyToken, productController.listOfProduct);

router
  .route("/:productId")
  .get(productController.getOneProduct)
  .patch(authController.verifyToken, productController.updateProduct)
  .delete(authController.verifyToken, productController.deleteProduct)
  .post(authController.verifyToken, productController.addReview);

router
  .route("/images/:productId")
  .patch(
    authController.verifyToken,
    upload.array("new_images", 20),
    productController.updateProductImages
  );

module.exports = router;

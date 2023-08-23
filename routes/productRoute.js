const path = require("path");
const express = require("express");
const authController = require("./../controllers/authController");
const multer = require("multer");
const router = express.Router();
router.use("/product-img", express.static("upload/product_img"));
router.use(express.json());

router.use("/", express.static("upload/product_img"));

const storage = multer.diskStorage({
  destination: "./upload/product_img",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 },
});

const productController = require("./../controllers/productController");

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
  .get(authController.verifyToken, productController.getOneProduct)
  .patch(authController.verifyToken, productController.updateProduct)
  .delete(authController.verifyToken, productController.deleteProduct);

router
  .route("/images/:productId")
  .patch(
    authController.verifyToken,
    upload.array("new_images", 20),
    productController.updateProdImages
  );
module.exports = router;

const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Product = require("./../modals/productsModal");
const Seller = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const path = require("path");
const fs = require("fs");
const Apifeatures = require("./../utils/ApiFeatures");
const CustomError = require("../utils/customErrorHandler");

const createProduct = asyncErrorHandler(async (req, res, next) => {
  console.log(req.files);
  const tokenObj = req.tokenObj;
  const seller = await Seller.findById(tokenObj.id);
  const org = await Org.findById(seller._org);

  const { name, description, price } = req.body;
  let arr = [];
  req.files.forEach((data) => {
    let obj = {
      public_id: data.filename,
      url: `http://localhost:${process.env.PORT}/products/${data.filename}`,
    };
    arr.push(obj);
  });

  const objData = {
    name: name,
    description: description,
    price: price,
    images: arr,
    sellerId: seller._id,
    _org: org,
  };
  const productData = await Product.create(objData);
  res.json({
    success: "success",
    data: productData,
  });
});

const getOneProduct = asyncErrorHandler(async (req, res, next) => {
  const productId = req.params.productId;
  console.log(req.params);
  const productData = await Product.findById(productId);
  res.status(200).json({
    status: "success",
    data: productData,
  });
});

const listOfProduct = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { page, limit } = req.query;
  const allDoc = await Product.find({ sellerId: tokenObj.id });
  const features = new Apifeatures(
    Product.find({ sellerId: tokenObj.id }),
    req.query
  )
    .sort()
    .filter()
    .paginate();
  const product = await features.query;
  res.status(200).json({
    status: "success",
    results: product,
    page: page,
    limit: limit,
    totalResults: allDoc.length,
    totalPages: Math.ceil(allDoc.length / limit),
  });
});

const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const { name, description, price } = req.body;
  const tokenObj = req.tokenObj;
  const prodId = req.params.productId;
  const updateProd = await Product.findByIdAndUpdate(
    prodId,
    { name: name, description: description, price: price },
    { runValidators: true, new: true }
  );
  res.status(200).json({
    status: "success",
    results: updateProd,
  });
});

const updateProdImages = asyncErrorHandler(async (req, res, next) => {
  const files = req.files;
  let deleteImages = [];
  deleteImages = JSON.parse(req.body.delete);
  console.log(req.params.productId);
  const product = await Product.find({ _id: req.params.productId });
  console.log(product);
  let imagesFromMongo = [];
  imagesFromMongo = product[0].images;
  console.log(product[0].images);
  req.files.forEach((data) => {
    let obj = {
      public_id: data.filename,
      url: `http://localhost:${process.env.PORT}/products/${data.filename}`,
    };
    imagesFromMongo.push(obj);
  });

  let imgs = [];

  imgs = imagesFromMongo.filter((data) => {
    for (let i = 0; i < deleteImages.length; i++) {
      if (data.public_id !== deleteImages[i].public_id) {
        return data;
      }
    }
  });
  console.log(imgs);
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    { images: imgs },
    { runValidators: true, new: true }
  );
  console.log(imgs);

  deleteImages.forEach((data) => {
    console.log(data);
    fs.unlinkSync(`upload/product_img/${data.public_id}`, function (err) {
      if (err) {
        const error = new CustomError(
          "Error occurred while deleting product images",
          400
        );
        return next(error);
      }
    });
  });

  res.status(200).json({
    status: "success",
    results: updatedProduct,
  });
});

const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const prodId = req.params.productId;
  const deleteProd = await Product.findByIdAndDelete(prodId);
  res.status(200).json({
    status: "success",
    results: null,
  });
});

module.exports = {
  createProduct,
  getOneProduct,
  listOfProduct,
  updateProduct,
  deleteProduct,
  updateProdImages,
};

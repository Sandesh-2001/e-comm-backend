const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Product = require("./../modals/productsModal");
const Seller = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const path = require("path");
const fs = require("fs");
const Apifeatures = require("./../utils/ApiFeatures");
const CustomError = require("../utils/customErrorHandler");
const { json } = require("body-parser");

const createProduct = asyncErrorHandler(async (req, res, next) => {

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
  const productData = await Product.findById(productId);
  res.status(200).json({
    status: "success",
    data: productData,
  });
});

const listOfProduct = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { page = 1, limit = 5, sort = "-createdAt", search = "" } = req.query;
  const allDoc = await Product.find({ sellerId: tokenObj.id });
  const features = await Product.find({
    sellerId: tokenObj.id,
    name: { $regex: search, $options: "i" },
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sort);

  const product = features;
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
  const { new_images } = req.body;

  const files = req.files;
  let deleteImages = [];
  deleteImages = req.body.delete || [];

  const product = await Product.find({ _id: req.params.productId });
  let imagesFromMongo = [];
  imagesFromMongo = product[0].images;
  req.files.forEach((data) => {
    let obj = {
      public_id: data.filename,
      url: `http://localhost:${process.env.PORT}/products/${data.filename}`,
    };
    imagesFromMongo.push(obj);
  });

  let uImgs = [];
  for (let i = 0; i < imagesFromMongo.length; i++) {
    if (deleteImages.length !== 0) {
      inner: for (let j = 0; j < deleteImages?.length; j++) {
        if (
          imagesFromMongo[i].public_id !==
          JSON.parse(deleteImages[j])["public_id"]
        ) {
          uImgs.push(imagesFromMongo[i]);
          break inner;
        }
      }
    } else {
      uImgs.push(imagesFromMongo[i]);
    }
  }

  // let newImg = [];
  // imagesFromMongo.forEach((data) => {
  //   deleteImages.forEach((img) => {
  //     if (data.public_id !== JSON.parse(img)["public_id"]) {
  //       newImg.push(data);
  //     }
  //   });
  // });

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    { images: uImgs },
    { runValidators: true, new: true }
  );
  newImg = [];
  for (let i = 0; i < deleteImages?.length; i++) {
    fs.unlinkSync(
      `upload/product_img/${JSON.parse(deleteImages[i])["public_id"]}`,
      function (err) {
        if (err) {
          const error = new CustomError(
            "Error occurred while deleting product images",
            400
          );
          return next(error);
        }
      }
    );
  }

  res.status(200).json({
    status: "success",
    results: updatedProduct,
  });
});

const updateProductImages = asyncErrorHandler(async (req, res, next) => {
  var deleteImages = { ...req.body };
  let k = deleteImages.delete;
  let isArray = Array.isArray(k);
  if (isArray) {
    let abc = [];

    for (var i of deleteImages.delete) {
     
      abc.push(JSON.parse(i || "{}"));
    }
    deleteImages = [...abc];
  } else {
    deleteImages = JSON.parse(k || "{}") || "{}";
  }

  let newImages = [];

  const product = await Product.findById(req.params.productId);
  let previousImages = product.images || [];
  // new images
  req.files.forEach((data) => {
    let obj = {
      public_id: data.filename,
      url: `http://localhost:${process.env.PORT}/products/${data.filename}`,
    };
    previousImages.push(obj);
  });
  // adding new images end
  // deleting the images
  let flag = false;
  if (deleteImages.length === 0) {
    newImages = previousImages;
  } else {
    for (let j = 0; j < previousImages.length; j++) {
      flag = false;
      if (isArray) {
        for (let i = 0; i < deleteImages.length; i++) {
          let match = deleteImages[i]["public_id"];
          if (previousImages[j]["public_id"] === match) {
            fs.unlinkSync(`upload/product_img/${match}`, function (err) {
              if (err) {
                const error = new CustomError(
                  "Error occurred while deleting product images",
                  400
                );
                return next(error);
              }
            });
            flag = true;
            break;
          }
        }
      } else {
        if (previousImages[j].public_id === deleteImages.public_id) {
          flag = true;
        }
      }
      if (!flag) {
        newImages.push(previousImages[j]);
      }
    }
  }

  // deleting the images complete

  let productData = await Product.findByIdAndUpdate(
    req.params.productId,
    {
      images: newImages,
    },
    { runValidators: true, new: true }
  );

  // for (let i = 0; i < deleteImages.length; i++) {
  //   fs.unlinkSync(
  //     `upload/product_img/${JSON.parse(deleteImages[i])["public_id"]}`,
  //     function (err) {
  //       if (err) {
  //         const error = new CustomError(
  //           "Error occurred while deleting product images",
  //           400
  //         );
  //         return next(error);
  //       }
  //     }
  //   );
  // }

  res.status(200).json({ result: productData });

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
  updateProductImages,
};

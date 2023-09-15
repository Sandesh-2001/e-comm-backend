const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Product = require("./../modals/productsModal");
const ApiFeatures = require("./../utils/ApiFeatures");
const Customer = require("./../modals/customerRegistration");
const jwt = require("jsonwebtoken");
const authController = require("./../controllers/authController");
const CustomError = require("../utils/customErrorHandler");
const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const features = new ApiFeatures(Product.find({}), req.query)
    .paginate()
    .sort()
    .filter();

  const productsData = await features.query;
  res.status(200).json({
    status: "success",
    results: productsData,
  });
});

const customerRegistration = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, address } = req.body;

  const data = {
    name,
    email,
    password,
    address,
    picture:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg-z5yd8c2ukIWdDLepcCRumTuC4Mlfx7hGA&usqp=CAU",
  };

  const registerCustomer = await Customer.create(data);
  const token = authController.signToken(registerCustomer.id);
  res.status(200).json({
    status: "success",
    results: registerCustomer,
    token: token,
  });
});

const customerLogin = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password + "this is password");
  const customerData = await Customer.findOne({
    email,
    password,
  });
  if (!customerData) {
    return next(new CustomError(`Incorrect email or password`));
  }
  token = authController.signToken(customerData._id);
  res.status(200).json({
    status: "success",
    results: customerData,
    token: token,
  });
});

const customerSelf = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;

  const customerData = await Customer.findById(tokenObj.id);
  if (!customerData) {
    return next(
      new CustomError(
        `The ${email} is not registered. Please register first!!!`
      )
    );
  }
  res.status(200).json({
    status: "success",
    results: customerData,
  });
});

module.exports = {
  getAllProducts,
  customerRegistration,
  customerLogin,
  customerSelf,
};

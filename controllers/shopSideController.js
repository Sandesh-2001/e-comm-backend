const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Product = require("./../modals/productsModal");
const ApiFeatures = require("./../utils/ApiFeatures");
const Customer = require("./../modals/customerRegistration");
const jwt = require("jsonwebtoken");
const authController = require("./../controllers/authController");
const CustomError = require("../utils/customErrorHandler");
const { OAuth2Client } = require("google-auth-library");
const Deal = require("./../modals/productDealModel");
const axios = require("axios");

const client = new OAuth2Client();

const getAllProducts = asyncErrorHandler(async (req, res, next) => {
  const { page = 1, limit = 5, sort = "-createdAt", search = "" } = req.query;
  const allDoc = await Product.find();
  const features = await Product.find({
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

const verifyRecaptcha = async (response) => {
  const secretKey = "6LcDrP0mAAAAALRFSn3BceF6Vr1nckEoyNPG1o0C";
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?response=${response}&secret=${process.env.CAPTCHA_SECRET_KEY}`;
    const options = {
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    return false;
  }
};

const signInWithGoogle = asyncErrorHandler(async (req, res, next) => {
  const { email, idToken, captcha } = req.body;
  const recaptchaVerificationResult = await verifyRecaptcha(captcha);

  // if (!recaptchaVerificationResult.success) {
  //   let error = new CustomError("Recaptcha verification failed", 401);
  //   return next(error);
  // }
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const userId = payload["sub"];

  const customerData = await Customer.findOne({
    email,
  });
  if (!customerData) {
    return next(new CustomError(`Incorrect email or password`));
  }
  const token = authController.signToken(customerData._id);
  res.status(200).json({
    status: "success",
    results: customerData,
    token: token,
  });
});

module.exports = {
  getAllProducts,
  customerRegistration,
  customerLogin,
  customerSelf,
  signInWithGoogle,
};

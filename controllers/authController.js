const User = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const jwt = require("jsonwebtoken");
const util = require("util");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const CustomError = require("./../utils/customErrorHandler");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  return token;
};

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, companyName } = req.body;

  const orgData = await Org.create({ name: companyName, email });

  const register = {
    name,
    email,
    password,
    _org: orgData._id,
  };

  let userData = await User.create(register);
  userData["_org"] = orgData;

  let data = { ...userData._doc, _org: orgData };
  console.log(
    "org data is" + orgData + "and userdata" + userData + "data is" + data
  );
  const token = signToken(userData._id);
  const expiresIn = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
  res.status(201).json({
    token: token,
    expiresIn,
    user: data,
  });
});

const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (
    !email ||
    !password ||
    email.trim().length == 0 ||
    password.trim().length === 0
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Email and Password are required field",
    });
  }
  const userData = await User.findOne({ email, password }).select("-__v");
  console.log("org" + userData._org);
  const orgData = await Org.findById({ _id: userData._org }).select("-__v");
  console.log(orgData);
  if (userData.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: `The user you are requesting with email ${email} doesn't exist. Please Register!!!`,
    });
  }
  const token = signToken(userData._id);
  const expiresIn = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
  const data = { ...userData._doc, _org: orgData };
  res.status(200).json({
    status: "success",
    token: token,
    expiresIn,
    user: data,
  });
});

const self = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const userData = await User.findById(tokenObj.id).select("-__v");
  const orgData = await Org.findById({ _id: userData._org }).select("-__v");
  const data = { ...userData._doc, _org: orgData };
  res.status(200).json(data);
});

const verifyToken = asyncErrorHandler(async (req, res, next) => {
  const rawToken = req.headers.authorization;
  // console.log("Authorization token is", token);
  let token1;
  if (rawToken && rawToken.startsWith("Bearer")) {
    token1 = rawToken.split(" ")[1];
  }
  if (!token1) {
    const error = new CustomError("Token Validation failed", 400);
    next(error);
  }
  const tokenObj = await util.promisify(jwt.verify)(
    token1,
    process.env.JWT_SECRET_KEY
  );
  req.tokenObj = tokenObj;
  next();
});

module.exports = { register, login, self, verifyToken };

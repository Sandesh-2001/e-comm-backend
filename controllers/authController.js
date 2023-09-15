const Seller = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const jwt = require("jsonwebtoken");
const EmailModal = require("./../modals/emailModal");
const util = require("util");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const CustomError = require("./../utils/customErrorHandler");
const Email = require("./../modals/emailModal");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  return token;
};

const verifyToken = asyncErrorHandler(async (req, res, next) => {
  console.log(req.headers.authorization);
  const rawToken = req.headers.authorization || req.query.token;
  // console.log("Authorization token is", token);
  let token1;
  if (!req.query.token) {
    if (rawToken && rawToken.startsWith("Bearer")) {
      token1 = rawToken.split(" ")[1];
    }
    if (!token1) {
      const error = new CustomError("Token Validation failed", 400);
      next(error);
    }
  } else {
    token1 = rawToken;
  }

  const tokenObj = await util.promisify(jwt.verify)(
    token1,
    process.env.JWT_SECRET_KEY
  );
  console.log(tokenObj, "token object is" + Date.now());
  if (tokenObj.exp <= Date.now()) {
  }
  req.tokenObj = tokenObj;

  next();
});

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, companyName } = req.body;

  const orgData = await Org.create({ name: companyName, email });

  const register = {
    name,
    email,
    password,
    _org: orgData._id,
  };

  let userData = await Seller.create(register);
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
  const userData = await Seller.findOne({
    email: email,
    password: password,
  }).select("-__v");
  if (!userData) {
    return res.status(404).json({
      status: "fail",
      message: `Incorrect email or password!!!`,
    });
  }
  const orgData = await Org.findById({ _id: userData._org }).select("-__v");
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
  const userData = await Seller.findById(tokenObj.id).select("-__v");
  const orgData = await Org.findById({ _id: userData._org }).select("-__v");
  const data = { ...userData._doc, _org: orgData };
  res.status(200).json(data);
});

//Advaced Auth

const changePassword = asyncErrorHandler(async (req, res, next) => {
  const { old_password, new_password } = req.body;
  const tokenObj = req.tokenObj;

  const changeRequest = await Seller.findById(tokenObj.id).select("+password");
  console.log("change request", changeRequest);
  if (changeRequest.password === old_password) {
    const updatePassword = await Seller.findByIdAndUpdate(
      tokenObj.id,
      {
        password: new_password,
      },
      { runValidators: true, new: true }
    );

    res.status(200).json({
      updatePassword,
    });
  } else {
    return res.status(401).json({
      status: "fail",
      message: "Old password doesn't match!!!",
    });
  }
});

const verifyLogin = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const seller = await Seller.findOne({ email: email });
  console.log("email is" + seller);

  if (!seller) {
    return res.json({
      message: `The requested ${email} email is not registered`,
    });
  }
  const emails = await EmailModal.find({ user_id: seller._id });

  req.emails = emails;
  req.userEmail = email;

  next();
});

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  const seller = await Seller.findOne({ email: email });
  if (!seller) {
    return res.status(404).json({
      status: "fail",
      message: `The email ${email} is not found on server`,
    });
  }
  const token = signToken(seller._id);
  const obj = {
    from: process.env.EMAIL,
    to: email,
    subject: "Forgot Password",
    content: `Dear user \n 
    To reset your password, click on this link: \n
    <a>${process.env.MAIL_LINK_START}/auth/reset-password?token${token}</a>
    \n
    If you did not request any password resets, then ignore this email.
    `,
    user_id: seller._id,
    link: `${process.env.MAIL_LINK_START}/auth/reset-password?token=${token}`,
  };

  const emailSave = await EmailModal.create(obj);

  res.status(200).json({
    status: "success",
    message: "Email sent successfully",
  });
});

const emailContent = asyncErrorHandler(async (req, res, next) => {
  const paramsData = req.params.id;
  const emailData = await Email.findById(paramsData);
  res.render("./../views/templates/emailContent.ejs", { email: emailData });
});

const emailHomeGet = asyncErrorHandler(async (req, res, next) => {
  console.log("this is requested email", req.userEmail);
  res.render("./../views/templates/emailHome.ejs", {
    emails: req.emails,
    userEmail: req.userEmail,
  });
});

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { email, password, captcha } = req.body;
  console.log(req.query.token, "request params is");
  const verifyToken = jwt.verify(req.query.token, process.env.JWT_SECRET_KEY);

  console.log("verify token is ", verifyToken);
  const sellerUpdate = await Seller.findByIdAndUpdate(
    verifyToken.id,
    { password: password },
    { runValidators: true, new: true }
  );

  res.status(200).json({
    status: "success",
    data: sellerUpdate,
  });
});

const sendVerificationEmail = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const seller = await Seller.findById(tokenObj.id);
  const token = signToken(tokenObj.id);
  const obj = {
    from: process.env.EMAIL,
    to: seller.email,
    subject: "Email Verification",
    content: `Dear user \n 
    To verify your account, click on this link: \n
    <a>${process.env.MAIL_LINK_START}/auth/reset-password?token${token}</a>
    \n
    If you did not request for verify account, then ignore this email.
    `,
    user_id: seller._id,
    link: `${process.env.MAIL_LINK_START}/auth/verify-email?token=${token}`,
  };

  const emailSave = await EmailModal.create(obj);

  res.status(200).json({
    status: "success",
    message: "Email sent successfully",
  });
});

const verifyEmail = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const verifySeller = await Seller.findByIdAndUpdate(
    tokenObj.id,
    { isEmailVerified: true },
    { runValidators: true, new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Email sent successfully",
    data: verifySeller,
  });
});

module.exports = {
  register,
  login,
  self,
  verifyToken,
  changePassword,
  verifyLogin,
  forgotPassword,
  emailContent,
  emailHomeGet,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  signToken,
};

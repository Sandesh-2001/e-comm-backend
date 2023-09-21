const Seller = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const jwt = require("jsonwebtoken");
const EmailModal = require("./../modals/emailModal");
const util = require("util");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const CustomError = require("./../utils/customErrorHandler");
const Email = require("./../modals/emailModal");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client();

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

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  return token;
};

const verifyToken = asyncErrorHandler(async (req, res, next) => {
  const rawToken = req.headers.authorization || req.query.token;
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
  if (tokenObj.exp <= Date.now()) {
  }
  req.tokenObj = tokenObj;

  next();
});

const register = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, companyName, captcha } = req.body;

  const reCaptchaVerification = await verifyRecaptcha(captcha);
  // if (!reCaptchaVerification.success) {
  //   let error = new CustomError("Recaptcha verification failed", 401);
  //   return next(error);
  // }

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

  const token = signToken(userData._id);
  const expiresIn = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
  res.status(201).json({
    token: token,
    expiresIn,
    user: data,
  });
});

const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password, captcha } = req.body;
  console.log(req.body);
  const reCaptchaVerification = await verifyRecaptcha(captcha);
  // if (!reCaptchaVerification.success) {
  //   let error = new CustomError("Recaptcha verification failed", 401);
  //   return next(error);
  // }
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
  res.render("./../views/templates/emailHome.ejs", {
    emails: req.emails,
    userEmail: req.userEmail,
  });
});

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { email, password, captcha } = req.body;
  const verifyToken = jwt.verify(req.query.token, process.env.JWT_SECRET_KEY);

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

const loginWithGoogle = asyncErrorHandler(async (req, res, next) => {
  const { email, idToken, captcha } = req.body;
  const reCaptchaVerification = await verifyRecaptcha(captcha);
  // if (!reCaptchaVerification.success) {
  //   let error = new CustomError("Recaptcha verification failed", 401);
  //   return next(error);
  // }

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];

  const userData = await Seller.findOne({
    email: email,
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
  loginWithGoogle,
};

const Seller = require("./../modals/sellerAuth");
const Org = require("./../modals/orgModal");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const ApiFeatures = require("./../utils/ApiFeatures");
const CustomError = require("./../utils/customErrorHandler");
const createUser = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const seller = await Seller.findById(req.tokenObj.id);
  const { name, email, password, role } = req.body;
  // const checkExistInUser = await User.findOne({ email: email });
  const checkExistInSeller = await Seller.findOne({ email: email });
  if (checkExistInSeller) {
    const error = new CustomError("The email " + email + "is already exist");
    return next(error);
  }
  const sellerData = await Seller.findById({ _id: tokenObj.id });

  const user = {
    name,
    email,
    password,
    role,
    _org: sellerData._org,
  };


  const sellerData1 = await Seller.create(user);
  const orgData = await Org.findById(sellerData._org);

  const data = { ...sellerData1._doc, _org: orgData };

  res.status(201).json(data);
});

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { page = 1, limit = 10, search = "", sort = "-createdAt" } = req.query;

  const sellers = await Seller.findById({ _id: tokenObj.id });
  const allData = await Seller.find({ _org: sellers._org });
  const totalResults = allData.length;
  if (search.length > 0) {
    const searchSeller = await Seller.find({
      _org: sellers._org,
      name: { $regex: search, $options: "i" },
    })
      .limit(10)
      .skip((page - 1) * limit)
      .sort(sort);

    let totalResults = searchSeller.length;

    return res.status(200).json({
      results: searchSeller,
      page: page,
      limit: limit,
      totalResults: totalResults,
      totalPages: Math.ceil(totalResults / limit),
    });
  }

  const features = await Seller.find({ _org: sellers._org })
    .limit(10)
    .skip((page - 1) * limit)
    .sort(sort);

  const userData = features;
  const orgData = await Org.findById(sellers._org);
  const data = userData.map((data) => {
    let obj = { ...data._doc, _org: orgData };
    return obj;
  });


  res.status(200).json({
    results: data,
    page: page,
    limit: limit,
    totalResults: totalResults,
    totalPages: Math.ceil(totalResults / limit),
  });
});

const getOrg = asyncErrorHandler(async (req, res, next) => {
  const seller = await Seller.findById(req.tokenObj.id);
  const org = await Org.findById(seller._org);
  res.status(200).json({
    org,
  });
});

const updateCompanyInfo = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { email, name } = req.body;

  const seller = await Seller.findById({ _id: tokenObj.id });

  const updateData = await Org.findByIdAndUpdate(
    seller._org,
    {
      email: email,
      name: name,
    },
    { runValidators: true, new: true }
  );
  res.status(202).json(updateData);
});

const updateUserInfo = asyncErrorHandler(async (req, res, next) => {
  const { email, name, password } = req.body;

  const updateData = await Seller.findByIdAndUpdate(
    req.params.userId,
    {
      email,
      name,
      password,
    },
    { runValidators: true, new: true }
  );
  if (!updateData) {
    return res.status(400).json({
      status: "fail",
      message: "Incorrect email or password!!! ",
    });
  }
  res.status(200).json(updateData);
});

const updateRole = asyncErrorHandler(async (req, res, next) => {
  const { role } = req.body;

  const getData = await Seller.findById(req.params.userId);
  if (!getData) {
    return res.status(400).json({
      status: "fail",
      message: "Incorrect email or password!!! ",
    });
  }
  const updateRoleData = await Seller.findByIdAndUpdate(
    req.params.userId,
    {
      role: role,
    },
    { runValidators: true, new: true }
  );

  res.status(200).json(updateRoleData);
});

const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const deleteData = await Seller.findByIdAndDelete(req.params.userId);

  res.status(200).json({
    status: "success",
    results: null,
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getOrg,
  updateCompanyInfo,
  updateUserInfo,
  updateRole,
  deleteUser,
};

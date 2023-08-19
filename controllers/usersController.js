const Seller = require("./../modals/sellerAuth");
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
  console.log("hii");

  const sellerData1 = await Seller.create(user);
  res.status(201).json(sellerData1);
});

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { page = 1, limit = 10 } = req.query;
  const sellers = await Seller.findById({ _id: tokenObj.id });
  const allData = await Seller.find({ _org: sellers._org });
  const features = new ApiFeatures(
    Seller.find({ _org: sellers._org }),
    req.query
  ).paginate();
  const userData = await features.query;
  const totalResults = allData.length;
  console.log("data is", allData);

  res.status(200).json({
    results: userData,
    page: page,
    limit: limit,
    totalResults: totalResults,
    totalPages: Math.ceil(totalResults / limit),
  });
});

const updateCompanyInfo = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { email, name } = req.body;

  const seller = await Seller.findById({ _id: tokenObj.id });

  const updateData = await Seller.findByIdAndUpdate(
    { "_org._id": new ObjectId(seller._org._id) },
    { $set: { "_org.name": name, "_org_.email": email } }
  );
  console.log("update Data" + updateData);
  res.status(202).json(updateData);
});

module.exports = { createUser, getAllUsers, updateCompanyInfo };

const Customer = require("./../modals/customerRegistration");
const fs = require("fs");
const path = require("path");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const CustomError = require("../utils/customErrorHandler");

const updateCustomerProfile = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;

  const { name, email } = req.body;

  const updateProfile = await Customer.findByIdAndUpdate(
    tokenObj.id,
    { name, email },
    { runValidators: true, new: true }
  );

  res.status(200).json({
    message: "success",
    results: updateProfile,
  });
});

const updateCustomerPicture = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const previousData = await Customer.findById(tokenObj.id);
  let str = previousData.picture;
  let index = str.indexOf("customer");
  if (index !== -1) {
    let pre = str.substring(+index + 10);

    fs.unlinkSync("upload/profile_img/" + pre);
  }

  const pictureUrl = `http://localhost:${process.env.PORT}/customers/${req.file.filename}`;
  const updateData = await Customer.findByIdAndUpdate(tokenObj.id, {
    picture: pictureUrl,
  });

  res.status(200).json({
    picture: pictureUrl,
  });
});

const deleteProfilePicture = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const customerData = await Customer.findByIdAndUpdate(tokenObj.id, {
    picture:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg-z5yd8c2ukIWdDLepcCRumTuC4Mlfx7hGA&usqp=CAU",
  });

  const picture = customerData.picture;

  const index = picture.indexOf("picture_");
  if (index !== -1) {
    const pictureData = picture.substring(index);

    fs.unlinkSync("upload/profile_img/" + pictureData, (err) => {
      return res.status(400).json({ message: err.message });
    });
  }

  res.status(200).json({
    message: "Profile image is deleted Successfully",
  });
});

const getSavedAddress = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const customerData = await Customer.findById(tokenObj.id);
  const addresses = customerData.address;
  res.status(200).json({
    status: "success",
    results: addresses,
  });
});

const addAddress = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;

  const customerData = await Customer.findByIdAndUpdate(tokenObj.id, {
    $push: { address: req.body },
  });

  res.status(200).json(req.body);
});

const updateAddress = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const { street, city, state, addressLine2, pin } = req.body;
  const addressId = req.params.addressId;
  const customerData = await Customer.findOneAndUpdate(
    { _id: tokenObj.id, "address._id": addressId },
    {
      $set: {
        "address.$.street": street,
        "address.$.city": city,
        "address.$.state": state,
        "address.$.addressLine2": addressLine2,
        "address.$.pin": pin,
        "address.$._id": addressId,
      },
    }
  );

  res.status(200).json({
    message: "updated",
  });
});

const deleteAddress = asyncErrorHandler(async (req, res, next) => {
  const tokenObj = req.tokenObj;
  const addressId = req.params.addressId;
  const customerData = await Customer.findOneAndUpdate(
    { _id: tokenObj.id },
    {
      $pull: { address: { _id: addressId } },
    },
    { safe: true, multi: false }
  );
  res.status(200).json(req.body);
});

const changePassword = asyncErrorHandler(async (req, res, next) => {
  const { old_password, new_password } = req.body;
  const customerData = await Customer.findById(req.tokenObj.id).select(
    "+password"
  );
  if (customerData.password !== old_password) {
    const error = new CustomError("Old password doesn't match", 401);
    return next(error);
  }
  const updatePassword = await Customer.findByIdAndUpdate(req.tokenObj.id, {
    password: new_password,
  });
  res.status(200).json({
    message: "Password updated successfully",
  });
});

const deleteAccount = asyncErrorHandler(async (req, res, next) => {
  await Customer.findByIdAndDelete(req.tokenObj.id);

  res.status(200).json({
    data: null,
    message: "User deleted successfully",
  });
});

module.exports = {
  updateCustomerProfile,
  updateCustomerPicture,
  deleteProfilePicture,
  getSavedAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
  deleteAccount,
};

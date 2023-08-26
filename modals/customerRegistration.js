const mongoose = require("mongoose");
const validator = require("validator");
const addressSchema = require("./customerAddressModel");
const registerSchema = mongoose.Schema(
  {
    email: {
      type: String,
      validate: [validator.isEmail, "Email must be in email format"],
      required: [true, "Email is required field"],
    },
    name: {
      type: String,
      required: [true, "Name is required field"],
    },
    password: {
      type: String,
      required: [true, "Password is required filed"],
      select: false,
    },
    address: [addressSchema],
    deleted: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const customerRegistrationModel = mongoose.model(
  "shopCustomer",
  registerSchema
);

module.exports = customerRegistrationModel;

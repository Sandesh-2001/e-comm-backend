const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    street: {
      type: String,
      //   required: [true, "Street is required field"],
    },
    addressLine2: {
      type: String,
      //   required: [true, "Address Line2 is required field"],
    },
    city: {
      type: String,
      required: [true, "City is required field"],
    },
    state: {
      type: String,
      required: [true, "State is required field"],
    },
    pin: {
      type: Number,
      required: [true, "PIN is required field"],
      maxLength: [6, "Maximum length is 6"],
      minLength: [6, "Minimum length is 6"],
    },
  },
  { timestamp: true }
);

const addressModel = mongoose.model("address", addressSchema);

module.exports = addressSchema;

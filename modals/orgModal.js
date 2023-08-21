const mongoose = require("mongoose");
const validator = require("validator");

const orgSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required field"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please enter a valid email"],
      lowercase: true,
      unique: [true, "This email is already registered"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const orgModal = mongoose.model("org", orgSchema);

module.exports = orgModal;

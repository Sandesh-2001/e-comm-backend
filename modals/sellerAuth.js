const mongoose = require("mongoose");
const validator = require("validator");

const registerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required field"],
    },

    email: {
      type: String,
      required: [true, "Email is required field"],
      validate: [validator.isEmail, "Please enter a valid email"],
      lowercase: true,
      unique: [true, "This email is already registed"],
    },
    password: {
      type: String,
      required: [true, "Password is required filed"],
      // minlength:[8, ],
      select: false,
    },
    _org: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const registerModal = mongoose.model("Seller", registerSchema);

module.exports = registerModal;

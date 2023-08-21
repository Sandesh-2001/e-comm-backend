const mongoose = require("mongoose");
const validator = require("validator");
const emailSchema = mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "subject is required field"],
    },
    from: {
      type: String,
      required: [true, "From is required field"],
      validate: [validator.isEmail, "Type email is required"],
    },
    to: {
      type: String,
      required: [true, "To is required field"],
      validate: [validator.isEmail, "Type email is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required field"],
    },
    link: {
      type: String,
      required: [true, "Content is required field"],
    },

    user_id: {
      type: String,
      required: [true, "user_id is required field"],
    },
  },
  { timestamps: true }
);
const emailModal = mongoose.model("email", emailSchema);

module.exports = emailModal;

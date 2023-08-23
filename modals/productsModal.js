const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "name is required field"],
    },
    description: {
      type: String,
    },
    images: {
      type: Array,
    },
    price: {
      type: Number,
      require: [true, "Price is required field"],
    },
    _org: {
      _id: { type: mongoose.Schema.ObjectId },
      name: { type: String },
      email: { type: String },
    },
    sellerId: {
      type: mongoose.Schema.ObjectId,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;

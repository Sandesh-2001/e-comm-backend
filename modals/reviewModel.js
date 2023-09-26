const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  star: Number,
  caption: String,
  customer_name: String,
  customer_photo: String,
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shopcustomer",
  },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
});

const reviewModel = mongoose.model("review", reviewSchema);

module.exports = reviewModel;

const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  star: Number,
  caption: String,
  customer_name: String,
  customer_photo: String,
  customer_id: mongoose.Schema.Types.ObjectId,
  product_id: mongoose.Schema.Types.ObjectId,
});

const reviewModel = mongoose.model("review", reviewSchema);

module.exports = reviewModel;

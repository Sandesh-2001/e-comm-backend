const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      // required:[true,""]
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
    },
    status: {
      type: String,
      enum: ["Accepted", "Declined"],
    },
  },
  { timestamps: true }
);
const paymentModel = mongoose.model("payment", paymentSchema);

module.exports = paymentModel;

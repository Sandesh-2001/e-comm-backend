const mongoose = require("mongoose");

const dealSchema = mongoose.Schema(
  {
    discount: {
      type: Number,
      required: true,
    },
    ends: {
      type: String,

      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
    },
    deleted: {
      type: Boolean,
      default: false,
      
    },
    
  },
  { timestamps: true }
);

const dealModel = mongoose.model("deal", dealSchema);

module.exports = dealModel;

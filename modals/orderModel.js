const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          required: [true, "Product id is mandatory"],
        },
        name: {
          type: String,
          required: [true, "Product name is required field"],
        },
        price: {
          type: Number,
          required: [true, "Product price is required field"],
        },
        qty: {
          type: Number,
          required: [true, "Product qty is required field"],
        },
        subTotal: {
          type: Number,
          required: [true, "Product subTotal is required field"],
        },
      },
    ],
    deliveryFee: {
      type: Number,
      required: [true, "Product deliveryFee is required field"],
    },
    total: {
      type: Number,
      required: [true, "Product total is required field"],
    },
    sellerId: {
      type: mongoose.Schema.ObjectId,
    },
    address: {
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
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    status: {
      type: String,
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Created by is required field"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);

module.exports = orderModel;

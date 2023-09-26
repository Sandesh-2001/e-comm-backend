const mongoose = require("mongoose");
const Deal = require("./productDealModel");

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
    deals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "deal",
    },
    category: {
      type: String,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
      },
    ],
  },
  { timestamps: true }
);

productSchema.post("find", async function (result) {
  console.log("find called");
  for (let i = 0; i < result.length; i++) {
    let productData = result[i];

    // if (product.deals) {
    //   for (j = 0; j < product.deals.length; j++) {
    //     const dealData = await Deal.findById(product.deals[j]);
    //     if (
    //       dealData.deleted !== true &&
    //       dealData.ends > new Date().toISOString()
    //     ) {
    //       let discount = dealData._doc.discount;
    //       let price = product.price;
    //       let dealPrice = Math.floor(price - (price * discount) / 100);

    //       let obj = {
    //         ...product._doc,
    //         deal: dealData._doc,
    //         dealPrice: dealPrice,
    //       };

    //       result[i] = obj;
    //     }
    //   }
    // }
    if (productData.deals) {
      let length = productData.deals.length;
      let flag = false;
      for (let J = length - 1; J >= 0; J--) {
        const dealData = await Deal.findById(productData.deals[J]);

        if (
          !flag &&
          dealData.deleted !== true &&
          dealData.ends > new Date().toISOString()
        ) {
          let discount = dealData._doc.discount;
          let price = productData.price;
          let dealPrice = Math.floor(price - (price * discount) / 100);

          let obj = {
            ...productData._doc,
            deal: dealData._doc,
            dealPrice: dealPrice,
          };
          result[i] = obj;
          flag = true;
        } else {
          await Deal.findByIdAndUpdate(productData.deals[J], { deleted: true });
        }
      }
    }
  }
});

productSchema.post("findById", async function (result) {
  console.log("findBy Id called");
  for (let i = 0; i < result.length; i++) {
    let product = result[i];
    if (product.deals) {
      for (j = 0; j < product.deals.length; j++) {
        const dealData = await Deal.findById(product.deals[j]);
        if (
          dealData.deleted !== true &&
          dealData.ends > new Date().toISOString()
        ) {
          let obj = { ...product._doc, deal: dealData._doc };

          result[i] = obj;
        }
      }
    }
  }
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;

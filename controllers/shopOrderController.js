const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Order = require("./../modals/orderModel");
const Payment = require("./../modals/paymentModel");
const Product = require("./../modals/productsModal");
const ApiFeatures = require("./../utils/ApiFeatures");
const puppeteer = require("puppeteer");
const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");
const { json } = require("body-parser");
const exp = require("constants");
const CustomError = require("../utils/customErrorHandler");
const createOrder = asyncErrorHandler(async (req, res, next) => {
  const userId = req.tokenObj.id;

  const data = { ...req.body, createdBy: userId };

  const order = await Order.create(data);

  res.status(200).json({
    status: "success",
    result: order,
  });
});

const getRandomLetter = () => {
  const arr = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  return arr[Math.ceil(Math.random() * 26)];
};

const makePayment = asyncErrorHandler(async (req, res, next) => {
  const sellerId = req.tokenObj.id;
  const { nameOnCard, cardNumber, expiry, cvv } = req.body;
  let expiryData = expiry.split("/");
  let name = nameOnCard.trim();
  let no = cardNumber;
  if (!name || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  if (
    parseInt(expiryData[0]) <= new Date().getMonth() &&
    parseInt(expiryData[1]) <= new Date().getFullYear()
  ) {
    let err = new CustomError("Expiry date must be greater than current date");
    return next(err);
  }
  if (no != "4111111111111111" && no != "5555555555554444") {
    return res.status(400).json({
      message: "Incorrect card details",
    });
  }

  let transactionId =
    getRandomLetter() +
    getRandomLetter() +
    getRandomLetter() +
    getRandomLetter() +
    getRandomLetter() +
    getRandomLetter();

  const orderId = req.params.orderId;

  const order = await Order.findById(orderId);
  let ordersArray = [];
  let found;
  let index;
  const orderItems = order.items;
  main: for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].productId);
    let productSellerId = product.sellerId.toString();
    if (ordersArray.length === 0) {
      let newArr = [];
      let obj = { ...orderItems[i]._doc, sellerId: productSellerId };
      newArr.push(obj);
      ordersArray.push(newArr);
      // break;
    } else {
      or: for (let j = 0; j < ordersArray.length; j++) {
        for (let k = 0; k < ordersArray[j].length; k++) {
          if (ordersArray[j][k].sellerId === productSellerId) {
            let obj = { ...orderItems[i]._doc, sellerId: productSellerId };

            ordersArray[j].push(obj);
            continue main;
          }
        }
      }

      let newArr = [];
      let obj = { ...orderItems[i]._doc, sellerId: productSellerId };
      newArr.push(obj);
      ordersArray.push(newArr);
    }
  }

  for (let i = 0; i < ordersArray.length; i++) {
    let total = 0;
    let sellerId;
    for (let j = 0; j < ordersArray[i].length; j++) {
      total = total + ordersArray[i][j].subTotal;
      sellerId = ordersArray[i][j].sellerId;
    }
    let object = {
      ...order._doc,
      items: ordersArray[i],
      total: total,
      paymentStatus: "Paid",
      status: "Confirmed",
    };
    delete object["_id"];
    object.sellerId = sellerId;

    await Order.create(object);
  }

  await Order.findByIdAndDelete(orderId);
  res.status(200).json({
    message: "Your order is successfully placed!!",
    results: ordersArray,
  });
});

const getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const allOrdersCount = await Order.find({
    createdBy: req.tokenObj.id,
  });
  let count = allOrdersCount.length;

  const { page = 1, limit = 5 } = req.query;
  const features = new ApiFeatures(
    Order.find({ createdBy: req.tokenObj.id }),
    req.query
  )
    .paginate()
    .sort()
    .filter();

  const allOrders = await features.query;

  res.status(200).json({
    results: allOrders,
    page: page,
    limit: limit,
    totalPages: Math.ceil(count / limit),
    totalResults: count,
  });
});

const getSpecificOrder = asyncErrorHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  const orderData = await Order.findById(orderId);
  res.status(200).json({
    results: orderData,
  });
});

const cancelOrder = asyncErrorHandler(async (req, res, next) => {
  const orderId = req.params.orderId;

  const updatedData = await Order.findByIdAndUpdate(orderId, {
    status: "Cancelled",
    paymentStatus: "Refunded",
  });
  res.status(200).json({
    message: "Order cancelled successfully",
  });
});

const compile = async (templateName, data) => {
  const filePath = path.join(
    process.cwd(),
    "views/templates",
    `${templateName}.ejs`
  );
  let aa;
  const a = fs.readFile(filePath, "utf-8", (err, html) => {
    aa = html;
    return html;
  });
  console.log(aa);
  console.log("hey");
  return aa;
};

const orderInvoice = asyncErrorHandler(async (req, res, next) => {
  const orderId = req.params.orderId;
  console.log(orderId);
  const orderDetails = await Order.findById(orderId);
  console.log(orderDetails);
  const data = JSON.parse(JSON.stringify(orderDetails));
  let templateName = "orderInvoice";
  const filePath = path.join(
    process.cwd(),
    "views/templates",
    `${templateName}.hbs`
  );
  let invoicePage;
  fs.readFile(filePath, "utf-8", async (err, html) => {
    let content = hbs.compile(html)({ order: data });

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(content);
    await page.emulateMediaType("screen");

    invoicePage = await page.pdf({
      path: "my-invoice.pdf",
      format: "A4",
      printBackground: true,
    });
  });

  console.log("done");
  console.log(invoicePage);
  return res.status(200).json({ message: "done" });
  // await process.exit();
});

const hello = async (req, res, next) => {
  res.json("hello");
};

module.exports = {
  createOrder,
  makePayment,
  getAllOrders,
  getSpecificOrder,
  cancelOrder,
  orderInvoice,
  hello,
};

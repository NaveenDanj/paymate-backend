const express = require("express");
const router = express.Router();
const Joi = require("joi");

// http://localhost:3000/success?paymentId=PAYID-MQEMC4I8J363980MC261522Y&token=EC-92M65422H50622442&PayerID=97WEGB5YA5B2U

router.get("/success", async (req, res) => {
  let paymentId = req.query.paymentId;
  let token = req.query.token;
  let payerID = req.query.PayerID;

  if (!paymentId || !token || !payerID) {
    return res.status(400).json({
      message: "Invalid payment credentials",
    });
  }

  //   get the payment object by pay-id

  //   update the payment transaction as succeed

  return res.status(200).json({
    message: "Payment completed!",
  });
});

router.get("/cancel", async (req, res) => {
  let paymentId = req.query.paymentId;
  let token = req.query.token;
  let payerID = req.query.PayerID;

  if (!paymentId || !token || !payerID) {
    return res.status(400).json({
      message: "Invalid payment credentials",
    });
  }

  //   get the payment object by pay-id

  //   update the payment transaction as succeed

  return res.status(200).json({
    message: "Payment is not completed!",
  });
});

module.exports = router;

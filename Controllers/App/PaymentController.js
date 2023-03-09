const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Payment = require("../../Models/Payment");

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
  let payment = await Payment.findOne({ payerID: paymentId });

  if (!payment) {
    return res.status(404).json({
      message: "Payment record not found!",
    });
  }

  //   update the payment transaction as succeed
  payment.status = "success";
  await payment.save();

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
  let payment = await Payment.findOne({ payerID: paymentId });

  if (!payment) {
    return res.status(404).json({
      message: "Payment record not found!",
    });
  }

  //   update the payment transaction as succeed
  payment.status = "failed";
  await payment.save();

  //   update the payment transaction as succeed

  return res.status(200).json({
    message: "Payment is not completed!",
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Payment = require("../../Models/Payment");
const { webHookCallback } = require("../../Services/PaypalSDKService");
const PaymentCallBackLog = require("../../Models/PaymentCallBackLog");

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
  let payment = await Payment.findOne({ PayId: paymentId });

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

router.post("/callback", async (req, res) => {
  // {
  //   "id": "WH-36J85531N6456625V-9DY49322TM581760P",
  //   "create_time": "2023-03-09T13:35:43.957Z",
  //   "resource_type": "payment",
  //   "event_type": "PAYMENTS.PAYMENT.CREATED",
  //   "summary": "Checkout payment is created and approved by buyer",
  //   "resource": {
  //     "update_time": "2023-03-09T13:35:43Z",
  //     "create_time": "2023-03-09T13:33:14Z",
  //     "redirect_urls": {
  //       "return_url": "http://localhost:5000/api/v1/payments/success?paymentId=PAYID-MQE6AGY1VT87058TJ580034T",
  //       "cancel_url": "http://localhost:5000/api/v1/payments/cancel"
  //     },
  //     "links": [
  //       {
  //         "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAYID-MQE6AGY1VT87058TJ580034T",
  //         "rel": "self",
  //         "method": "GET"
  //       },
  //       {
  //         "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAYID-MQE6AGY1VT87058TJ580034T/execute",
  //         "rel": "execute",
  //         "method": "POST"
  //       },
  //       {
  //         "href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-2GP104344L5375539",
  //         "rel": "approval_url",
  //         "method": "REDIRECT"
  //       }
  //     ],
  //     "id": "PAYID-MQE6AGY1VT87058TJ580034T",
  //     "state": "created",
  //     "transactions": [
  //       {
  //         "amount": {
  //           "total": "10.99",
  //           "currency": "USD"
  //         },
  //         "payee": {
  //           "merchant_id": "VY3PSEWQ5LKAC",
  //           "email": "sb-3qpio25212409@business.example.com"
  //         },
  //         "description": "Wallet Top-Up",
  //         "item_list": {
  //           "shipping_address": {
  //             "recipient_name": "Naveen Hettiwaththa",
  //             "line1": "adasdasd",
  //             "line2": "asdasdasd",
  //             "city": "Polgasowita",
  //             "state": "",
  //             "postal_code": "10320",
  //             "country_code": "LK",
  //             "default_address": false,
  //             "preferred_address": false,
  //             "primary_address": false,
  //             "disable_for_transaction": false
  //           }
  //         },
  //         "related_resources": []
  //       }
  //     ],
  //     "intent": "sale",
  //     "payer": {
  //       "payment_method": "paypal",
  //       "status": "UNVERIFIED",
  //       "payer_info": {
  //         "email": "hettiwaththanaveen333@gmail.com",
  //         "first_name": "Naveen",
  //         "last_name": "Hettiwaththa",
  //         "payer_id": "LJ5D8R7LJL4NL",
  //         "shipping_address": {
  //           "recipient_name": "Naveen Hettiwaththa",
  //           "line1": "adasdasd",
  //           "line2": "asdasdasd",
  //           "city": "Polgasowita",
  //           "state": "",
  //           "postal_code": "10320",
  //           "country_code": "LK",
  //           "default_address": false,
  //           "preferred_address": false,
  //           "primary_address": false,
  //           "disable_for_transaction": false
  //         },
  //         "country_code": "LK"
  //       }
  //     },
  //     "cart": "2GP104344L5375539"
  //   },
  //   "status": "PENDING",
  //   "transmissions": [
  //     {
  //       "webhook_url": "https://stg-paymate.onrender.com/api/v1/transaction/callback",
  //       "transmission_id": "560ed4d0-be7f-11ed-a23b-274b07fab631",
  //       "status": "PENDING"
  //     }
  //   ],
  //   "links": [
  //     {
  //       "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-36J85531N6456625V-9DY49322TM581760P",
  //       "rel": "self",
  //       "method": "GET",
  //       "encType": "application/json"
  //     },
  //     {
  //       "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-36J85531N6456625V-9DY49322TM581760P/resend",
  //       "rel": "resend",
  //       "method": "POST",
  //       "encType": "application/json"
  //     }
  //   ],
  //   "event_version": "1.0"
  // }

  const body = req.body;
  try {
    let response = await webHookCallback(req, res);

    let log = new PaymentCallBackLog({
      callBackObject: response,
    });

    await log.save();

    console.log(log);

    return res.status(200).json({
      message: "Transaction succeed",
    });
  } catch (err) {
    res.status(400).json({
      message: "Error while processing the server callback",
    });
  }
});

module.exports = router;

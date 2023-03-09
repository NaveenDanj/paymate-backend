const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { getTransactionStatus } = require("../../Services/PaypalSDKService");

router.post("/fund-transfer");
router.post("/qr-pay");

router.post("/qr-init-payment");
router.post("/get-user-transactions");

router.post("/token-url-init-payment");
router.post("/token-url-init-payment");

router.get("/get-transaction-status", async (req, res) => {
  let transaction_id = req.query.payId;

  if (!transaction_id) {
    return res.status(400).json({
      message: "Invalid query. Transaction id not provided!",
    });
  }

  try {
    let ress = await getTransactionStatus(transaction_id);

    return res.status(200).json({
      paymentObject: ress,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Transaction not found!",
      error: err,
    });
  }
});

module.exports = router;

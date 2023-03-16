const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { getTransactionStatus } = require("../../Services/PaypalSDKService");
const Wallet = require("../../Models/Wallet");

router.post("/fund-transfer", async (req, res) => {
  let validator = Joi.object({
    toWalletId: Joi.string().required(),
    amount: Joi.number().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = await Wallet.findOne({ userId: user._id });
    let toWallet = await Wallet.findOne({ _id: data.toWalletId });

    if (!toWallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    if (data.amount < 0) {
      return res.status(400).json({
        message: "Error while processing the transaction! Invalid amount.",
      });
    }

    if (!wallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    if (wallet.Balance < data.amount) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Insufficient balance.",
      });
    }

    // process the transaction
  } catch (err) {
    return res.status(400).json({
      message: "Error while processing the transaction!",
      error: err,
    });
  }
});
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

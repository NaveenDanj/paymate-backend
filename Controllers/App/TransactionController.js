const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { getTransactionStatus } = require("../../Services/PaypalSDKService");
const Wallet = require("../../Models/Wallet");
const Transaction = require("../../Models/Transaction");
const Constance = require("../../Models/Constance");
const AuthRequired = require("../../Middlewares/AuthRequired");
const qrCode = require("qrcode");
const { generateUUIDToken } = require("../../Services/TokenService");

router.post("/fund-transfer", AuthRequired("User"), async (req, res) => {
  let validator = Joi.object({
    toWalletId: Joi.string().required(),
    amount: Joi.number().required(),
    userRemarks: Joi.string().required(),
    receiverRemarks: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = await Wallet.findOne({ userId: user._id });
    let toWallet = await Wallet.findOne({ _id: data.toWalletId });

    let consts = await Constance.findOne({ _id: "6412de595c9d4b8374c2be4d" });

    if (wallet._id == data.toWalletId) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Cannot fund to your own wallet.",
      });
    }

    if (!toWallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    if (
      data.amount > consts.maxQrpayAmount ||
      data.amount < consts.minQrpayAmount
    ) {
      return res.status(400).json({
        message:
          "Maximum payment amount is " +
          consts.maxQrpayAmount.toString() +
          " and minimum payment amount is " +
          consts.minQrpayAmount.toString(),
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
    let transaction = new Transaction({
      fromUserId: req.user._id,
      fromWalletId: wallet._id,
      toUserId: toWallet.userId,
      toWalletId: toWallet._id,
      type: "fund-transfer",
      userRemarks: data.userRemarks,
      receiverRemarks: data.receiverRemarks,
      status: "created",
      amount: data.amount,
    });

    await transaction.save();

    // update the sender wallet balance
    wallet.Balance = wallet.Balance - data.amount;
    await wallet.save();

    return res.status(200).json({
      message: "Fund transfer transaction created",
      transaction,
      wallet,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while processing the transaction!",
      error: err,
    });
  }
});

router.post("/qr-init-payment", AuthRequired("User"), async (req, res) => {
  let validator = Joi.object({
    amount: Joi.number().required(),
    userRemarks: Joi.string().required(),
    receiverRemarks: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = await Wallet.findOne({ userId: user._id });

    let consts = await Constance.findOne({ _id: "6412de595c9d4b8374c2be4d" });

    if (
      data.amount > consts.maxQrpayAmount ||
      data.amount < consts.minQrpayAmount
    ) {
      return res.status(400).json({
        message:
          "Maximum payment amount is " +
          consts.maxQrpayAmount.toString() +
          " and minimum payment amount is " +
          consts.minQrpayAmount.toString(),
      });
    }

    if (!wallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    let transaction = new Transaction({
      fromUserId: req.user._id,
      fromWalletId: wallet._id,
      type: "qr-pay",
      userRemarks: data.userRemarks,
      receiverRemarks: data.receiverRemarks,
      status: "created",
      amount: data.amount,
      payerId: null,
      payerWallet: null,
    });

    await transaction.save();

    let encode_data = JSON.stringify(transaction._id);

    qrCode.toDataURL(encode_data, async (err, url) => {
      if (err) {
        return res.status(500).send("Internal server error");
      } else {
        await Transaction.updateOne({ _id: transaction._id }, { qrCode: url });
        return res.status(200).json({
          qrcode: url,
          qrCodeHTML: `<img src='${url}' alt='Paymate QR Code'>`,
        });
      }
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while processing the transaction",
    });
  }
});

router.post("/qr-pay", AuthRequired("User"), async (req, res) => {
  let validator = Joi.object({
    transactionId: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = req.userWallet;

    if (!wallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    let transaction = await Transaction.findOne({ _id: data.transactionId });

    if (!transaction) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Payment request not found.",
      });
    }

    if (transaction.status != "created") {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Payment request expired.",
      });
    }

    if (wallet.Balance < transaction.amount) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Insufficient balance.",
      });
    }

    wallet.Balance = wallet.Balance - transaction.amount;
    await wallet.save();

    await Transaction.updateOne(
      { _id: transaction._id },
      {
        status: "quied",
        payerId: user._id.toString(),
        payerWallet: wallet._id.toString(),
      }
    );

    return res.status(200).json({
      message: "Qr payment accepted by the paymate",
      transaction,
      wallet,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while processing the transaction",
    });
  }
});

router.post("/get-user-transactions");

router.post(
  "/token-url-init-payment",
  AuthRequired("User"),
  async (req, res) => {
    let validator = Joi.object({
      amount: Joi.number().required(),
      userRemarks: Joi.string().required(),
      receiverRemarks: Joi.string().required(),
    });

    try {
      const data = await validator.validateAsync(req.body, {
        abortEarly: false,
      });
      let wallet = req.userWallet;

      let consts = await Constance.findOne({ _id: "6412de595c9d4b8374c2be4d" });

      if (
        data.amount > consts.maxQrpayAmount ||
        data.amount < consts.minQrpayAmount
      ) {
        return res.status(400).json({
          message:
            "Maximum payment amount is " +
            consts.maxQrpayAmount.toString() +
            " and minimum payment amount is " +
            consts.minQrpayAmount.toString(),
        });
      }

      if (!wallet) {
        return res.status(400).json({
          message: "Error while processing the transaction! Wallet not found.",
        });
      }

      let token = generateUUIDToken();

      let transaction = new Transaction({
        fromUserId: req.user._id,
        fromWalletId: wallet._id,
        type: "token-pay",
        userRemarks: data.userRemarks,
        receiverRemarks: data.receiverRemarks,
        status: "created",
        amount: data.amount,
        payerId: null,
        payerWallet: null,
        token: token,
      });

      await transaction.save();

      return res.status(200).json({
        message: "Payment Link created successfully",
        token,
        transaction,
      });
    } catch (err) {
      return res.status(400).json({
        message: "Error while processing the transaction",
      });
    }
  }
);

router.post("/token-url-pay", AuthRequired("User"), async (req, res) => {
  let validator = Joi.object({
    transactionId: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = req.userWallet;

    if (!wallet) {
      return res.status(400).json({
        message: "Error while processing the transaction! Wallet not found.",
      });
    }

    let transaction = await Transaction.findOne({ _id: data.transactionId });

    if (!transaction) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Payment request not found.",
      });
    }

    if (transaction.status != "created") {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Payment request expired.",
      });
    }

    if (wallet.Balance < transaction.amount) {
      return res.status(400).json({
        message:
          "Error while processing the transaction! Insufficient balance.",
      });
    }

    wallet.Balance = wallet.Balance - transaction.amount;
    await wallet.save();

    await Transaction.updateOne(
      { _id: transaction._id },
      {
        status: "quied",
        payerId: user._id.toString(),
        payerWallet: wallet._id.toString(),
      }
    );

    return res.status(200).json({
      message: "Payment link accepted by the paymate",
      transaction,
      wallet,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while processing the transaction",
    });
  }
});

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

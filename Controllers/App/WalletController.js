const express = require("express");
const Wallet = require("../../Models/Wallet");
const User = require("../../Models/User");
const router = express.Router();
const Joi = require("joi");
const { validateCardInformation } = require("../../Services/PaypalSDKService");
const CardInformation = require("../../Models/CardInformation");
const AuthRequired = require("../../Middlewares/AuthRequired");
const { hashData } = require("../../Services/passwordService");

router.get("/", async (req, res) => {
  let page = +req.query.page || 1;
  let limit = +req.query.limit || 10;
  let skip = (page - 1) * limit;

  let wallets = await Wallet.find({}).skip(skip).limit(limit);

  return res.status(200).json({
    wallets: wallets,
    paging: {
      count: await Wallet.countDocuments(),
      page: page,
      limit: limit,
    },
  });
});

router.post("/wallet-change-status", async (req, res) => {
  let validator = Joi.object({
    userId: Joi.string().required(),
    suspend: Joi.boolean().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = await User.findById({ _id: data.userId });

    user.activated = data.suspend;
    await user.save();

    return res.status(200).json({
      message: "Wallet status change successfully!",
      user: user,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});

router.post("/add-card", AuthRequired("User"), async (req, res) => {
  let validator = Joi.object({
    cardHolderName: Joi.string().required(),
    cardNumber: Joi.string().required(),
    cardCVV: Joi.string().required(),
    cardExpireMonth: Joi.string().required(),
    cardExpireYear: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    let user = req.user;
    let wallet = await Wallet.findOne({ userId: user._id });

    if (!wallet) {
      return res.status(404).json({
        message: "wallet not found!",
      });
    }

    // chek card already added to the wallet
    let check_card_exists = await CardInformation.findOne({
      cardNumber: data.cardNumber,
    });

    if (check_card_exists) {
      return res.status(400).json({
        message: "This card is already added to a wallet",
      });
    }

    const card = {
      number: data.cardNumber,
      type: "visa",
      expire_month: +data.cardExpireMonth,
      expire_year: +data.cardExpireYear,
      cvv2: data.cardCVV,
    };

    let cardinfo = await validateCardInformation(card);

    if (cardinfo == false) {
      return res.status(200).json({
        message: "Card Validation failed!",
        card: cardinfo,
      });
    }

    let card_information = new CardInformation({
      userId: user._id,
      walletId: wallet._id,
      cardHolderName: data.cardHolderName,
      cardNumber: data.cardNumber,
      expireMonth: await hashData(data.cardExpireMonth),
      expireYear: await hashData(data.cardExpireYear),
      cvv: await hashData(data.cardCVV),
      cardId: cardinfo.id,
    });

    await card_information.save();

    return res.status(200).json({
      message: "Validation success",
      card: cardinfo,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});

router.post("/remove-current-card", async (req, res) => {
  return false;
});

module.exports = router;

const express = require("express");
const Wallet = require("../../Models/Wallet");
const User = require("../../Models/User");
const router = express.Router();
const Joi = require("joi");

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

router.post("/add-card", async (req, res) => {
  let user = req.user;
  return false;
});

router.post("/remove-current-card", async (req, res) => {
  return false;
});

module.exports = router;

const express = require("express");
const User = require("../Models/User");
const router = express.Router();
const Joi = require("joi");
const { hashPasswod, comparePassword } = require("../Services/passwordService");
// const { generateToken } = require("../../Services/AuthService");

router.post("/", async (req, res) => {
  let validator = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    const val = await validator.validateAsync(req.body, { abortEarly: false });

    let user = new Invoice({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });

    let userObject = await user.save();

    return res.status(201).json({
      message: "New user created",
      user: userObject,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error creating job",
      error: err,
    });
  }
});

module.exports = router;

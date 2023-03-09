const express = require("express");
const User = require("../Models/User");
const Token = require("../Models/Token");
const router = express.Router();
const Joi = require("joi");
const { hashPasswod, comparePassword } = require("../Services/PasswordService");
const { generateToken } = require("../Services/JWTService");
const { generateUUIDToken } = require("../Services/TokenService");
const AuthRequired = require("../Middlewares/AuthRequired");
const AuditLogRecord = require("../Services/AuditLogService");
const Wallet = require("../Models/Wallet");

router.post("/", async (req, res) => {
  let validator = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    deviceType: Joi.string().required(),
  });

  try {
    await validator.validateAsync(req.body, { abortEarly: false });
    const hashedPassword = await hashPasswod(req.body.password);
    let user = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    });

    // check of user email
    let email_check = await User.findOne({ email: req.body.email });
    if (email_check) {
      return res.status(400).json({
        message: "Email already user in another account!",
      });
    }

    // check for user phone
    let phone_check = await User.findOne({ phone: req.body.phone });
    if (phone_check) {
      return res.status(400).json({
        message: "Phone number already user in another account!",
      });
    }

    let userObject = await user.save();

    //generate the activation token
    let activationToken = new Token({
      userId: user._id,
      token: generateUUIDToken(),
      type: "activation",
      deviceType: req.body.deviceType,
      IPAddress: req.socket.remoteAddress,
    });

    await activationToken.save();

    // create user wallet
    let _wallet = new Wallet({
      userId: user._id,
      name: req.body.fullname + "'s wallet",
    });

    _wallet.save();

    // send activation otp to email later to the phone as sms

    return res.status(201).json({
      message: "New user created",
      user: userObject,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error creating user",
      error: err,
    });
  }
});

router.get("/activate-account", async (req, res) => {
  if (!req.query.token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  let activation_token = req.query.token;

  try {
    let token = await Token.findOne({
      token: activation_token,
      type: "activation",
    });

    if (!token) {
      return res.status(400).json({
        message: "Account activation failed",
      });
    }

    // get the user account!
    let user = await User.findOne({ userId: token.userId });

    if (!user) {
      return res.status(400).json({
        message: "Account activation failed. Account not found!",
      });
    }

    if (user.activated) {
      return res.status(400).json({
        message: "Account already activated",
      });
    }

    // update the user account!
    user.activated = true;
    await user.save();

    await token.deleteOne();

    return res.status(200).json({
      message: "User account activated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error while activating user account",
      error: err,
    });
  }
});

router.post("/login-email", async (req, res) => {
  let validator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    deviceType: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });

    let user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(400).json({
        message: "Email or password is incorrect!",
      });
    }

    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect!",
      });
    }

    let _token = generateToken({ email: user.email });
    const ip = req.clientIp;

    let accessToken = new Token({
      userId: user._id,
      token: _token,
      type: "auth",
      deviceType: data.deviceType,
      IPAddress: req.socket.remoteAddress,
    });

    await accessToken.save();

    delete user.password;

    AuditLogRecord(req, res, "Login-email");

    return res.status(200).json({
      message: "User logged in successfully",
      user: user,
      token: _token,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error logging in user",
      error: err,
    });
  }
});

router.post("/login-phone", async (req, res) => {
  let validator = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required(),
    deviceType: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });

    let user = await User.findOne({ phone: data.phone });

    if (!user) {
      return res.status(400).json({
        message: "Phone number or password is incorrect!",
      });
    }

    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Phone number or password is incorrect!",
      });
    }

    let _token = generateToken({ email: user.email });
    const ip = req.clientIp;

    let accessToken = new Token({
      userId: user._id,
      token: _token,
      type: "auth",
      deviceType: data.deviceType,
      IPAddress: req.socket.remoteAddress,
    });

    await accessToken.save();

    delete user.password;

    AuditLogRecord(req, res, "Login-phone");

    return res.status(200).json({
      message: "User logged in successfully",
      user: user,
      token: _token,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error logging in user",
      error: err,
    });
  }
});

router.get("/current-user", AuthRequired("User"), async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

router.post("/logout", AuthRequired("User"), async (req, res) => {
  let user_token = req.headers["authorization"];

  try {
    let token = await Token.findOne({ token: user_token });

    if (!token) {
      return res.status(400).json({
        message: "Access denied",
      });
    }

    await token.deleteOne();

    AuditLogRecord(req, res, "Logout");

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error logout user",
      error: err,
    });
  }
});

router.post("/forgot-password-send-token", async (req, res) => {
  let validator = Joi.object({
    email: Joi.string().email().required(),
    deviceType: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    let token = generateUUIDToken();
    let has_token_generated_before = await Token.find({
      userId: user._id,
      type: "password-reset",
    });

    if (has_token_generated_before.length > 0) {
      return res.status(401).json({
        message: "Previous token not expired yet!",
      });
    }

    let new_token = new Token({
      userId: user._id,
      token: token,
      type: "password-reset",
      deviceType: data.deviceType,
      IPAddress: req.socket.remoteAddress,
    });

    await new_token.save();

    // send token to the user email

    return res.status(200).json({
      message: "Password reset token send to your email!",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});

router.post("/forgot-password-verify-token", async (req, res) => {
  let validator = Joi.object({
    email: Joi.string().email().required(),
    deviceType: Joi.string().required(),
    token: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    let token_exists = await Token.findOne({
      userId: user._id,
      type: "password-reset",
      token: data.token,
    });

    if (!token_exists) {
      return res.status(404).json({
        message: "Token verification failed!",
      });
    }

    let token = generateUUIDToken();

    let new_token = new Token({
      userId: user._id,
      token: token,
      type: "password-reset-act",
      deviceType: data.deviceType,
      IPAddress: req.socket.remoteAddress,
    });

    await new_token.save();
    await token_exists.deleteOne();

    // send token to the user email

    return res.status(200).json({
      message: "Token verfied successfully!",
      resetPasswordtoken: token,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});

router.post("/forgot-password-reset-password", async (req, res) => {
  let validator = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    const data = await validator.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    let token_exists = await Token.findOne({
      userId: user._id,
      type: "password-reset-act",
      token: data.token,
    });

    if (!token_exists) {
      return res.status(404).json({
        message: "Token verification failed!",
      });
    }

    user.password = await hashPasswod(data.password);
    await user.save();

    return res.status(200).json({
      message: "Password reseted successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong. Please try again!",
      error: err,
    });
  }
});

module.exports = router;

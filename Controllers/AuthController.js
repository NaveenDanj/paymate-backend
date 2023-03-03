const express = require("express");
const User = require("../../Models/User");
const router = express.Router();
const Joi = require("joi");
const {
  hashPasswod,
  comparePassword,
} = require("../../Services/passwordService");
const { generateToken } = require("../../Services/AuthService");
const AuthRequired = require("../../Middlewares/AuthRequired");
const AccessToken = require("../../Models/AccessToken");
const ResetPasswordController = require("./ResetPasswordController");

module.exports = router;

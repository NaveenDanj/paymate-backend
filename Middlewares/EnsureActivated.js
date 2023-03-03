const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Token = require("../Models/Token");

const AuthRequired = () => {
  return async (req, res, next) => {
    const token = req.headers["authorization"];

    let user = req.user;

    if (!user.activated) {
      return res.status(401).send({ error: "user not activated!" });
    }

    next();
  };
};

module.exports = AuthRequired;

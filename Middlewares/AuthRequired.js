const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Token = require("../Models/Token");
const AuthToken = require("../Models/AuthToken");
const Wallet = require("../Models/Wallet");

const AuthRequired = (userRole) => {
  return async (req, res, next) => {
    const token = req.headers["authorization"];

    let roleMapper = {
      SuperAdmin: 3,
      Admin: 2,
      User: 1,
    };

    if (!token) {
      return res.status(401).send({ error: "Unauthenticated" });
    }

    // in future check if token is in blacklist(logged out before token expired)
    try {
      let checkExists = await AuthToken.findOne({ token: token });

      if (!checkExists) {
        return res.status(401).send({ error: "Unauthenticated" });
      }
    } catch (err) {
      return res.status(401).send({ error: "Unauthenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userObject) => {
      if (err) return res.status(403).json({ message: "Unauthenticated" });

      try {
        let user = await User.findOne({ email: userObject.email }).select(
          "-password"
        );
        if (roleMapper[user.role] < roleMapper[userRole]) {
          return res.status(403).send({ error: "You are not authorized" });
        }

        req.user = user;
        req.userWallet = await Wallet.findOne({ userId: req.user._id });
        next();
      } catch (err) {
        return res.status(401).send({ error: "Unauthenticated" });
      }
    });
  };
};

module.exports = AuthRequired;

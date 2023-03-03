const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Token = require("../Models/Token");

const AuthRequired = (userRole) => {
  return async (req, res, next) => {
    const token = req.headers["authorization"];

    let roleMapper = {
      Admin: 2,
      User: 1,
    };

    if (!token) {
      return res.status(401).send({ error: "Invalid token" });
    }

    // in future check if token is in blacklist(logged out before token expired)
    try {
      let checkExists = await Token.findOne({ token: token });

      if (!checkExists) {
        return res.status(401).send({ error: "Invalid token" });
      }
    } catch (err) {
      return res.status(401).send({ error: "Invalid token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userObject) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      try {
        let user = await User.findOne({ email: userObject.email }).select(
          "-password"
        );
        if (roleMapper[user.role] < roleMapper[userRole]) {
          return res.status(403).send({ error: "You are not authorized" });
        }

        req.user = user;
        next();
      } catch (err) {
        return res.status(401).send({ error: "Error while finding user" });
      }
    });
  };
};

module.exports = AuthRequired;

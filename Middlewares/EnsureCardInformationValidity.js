const CardInformation = require("../Models/CardInformation");

const EnsureCardInformationValidity = () => {
  return async (req, res, next) => {
    let user = req.user;

    if (!user.activated) {
      return res.status(401).send({ error: "user not activated!" });
    }

    let card_info = await CardInformation.findOne({ userId: user._id });

    if (!card_info) {
      return res.status(403).json({
        message: "No relevent card information found!",
      });
    }

    next();
  };
};

module.exports = EnsureCardInformationValidity;

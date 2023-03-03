const AuthRequired = () => {
  return async (req, res, next) => {
    let user = req.user;

    if (!user.activated) {
      return res.status(401).send({ error: "user not activated!" });
    }

    next();
  };
};

module.exports = AuthRequired;

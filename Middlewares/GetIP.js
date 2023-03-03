const requestIp = require("request-ip");

const ipMiddleware = (req, res, next) => {
  return async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    next();
  };
};

module.exports = { ipMiddleware };

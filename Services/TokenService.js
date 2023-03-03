const { v4 } = require("uuid");

module.exports = {
  // generate random token for reset password link
  generateUUIDToken() {
    return v4();
  },
};

let bcrypt = require("bcryptjs");

module.exports = {
  hashPasswod(password) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          reject(err);
        }
        bcrypt.hash(password, salt, async function (err, hash) {
          if (err) {
            reject(err);
          }
          resolve(hash);
        });
      });
    });
  },

  hashData(data) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          reject(err);
        }
        bcrypt.hash(data, salt, async function (err, hash) {
          if (err) {
            reject(err);
          }
          resolve(hash);
        });
      });
    });
  },

  compareData(data, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(data, hash, function (err, isMatch) {
        if (err) {
          reject(err);
        }
        resolve(isMatch);
      });
    });
  },

  comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function (err, isMatch) {
        if (err) {
          reject(err);
        }
        resolve(isMatch);
      });
    });
  },
};

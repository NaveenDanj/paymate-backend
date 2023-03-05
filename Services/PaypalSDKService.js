const { v4 } = require("uuid");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", // set the environment to sandbox or production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const validateCardInformation = (card) => {
  return new Promise((resolve, reject) => {
    paypal.creditCard.create(card, function (err, creditCard) {
      if (err) {
        resolve(false);
      } else {
        if (creditCard.state === "ok") {
          resolve(creditCard);
        } else {
          resolve(false);
        }
      }
    });
  });
};

module.exports = { paypal, validateCardInformation };

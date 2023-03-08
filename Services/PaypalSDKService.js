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

const createPayment = async (amount) => {
  const payment = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        amount: {
          total: amount,
          currency: "USD",
        },
        payment_options: {
          allowed_payment_method: "IMMEDIATE_PAY",
        },
        description: "Wallet Top-Up",
      },
    ],
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, (err, payment) => {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};

module.exports = { paypal, validateCardInformation, createPayment };

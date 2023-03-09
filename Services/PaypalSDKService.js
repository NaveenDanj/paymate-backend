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
      return_url: process.env.BASE_URL + "/payments/success",
      cancel_url: process.env.BASE_URL + "/payments/cancel",
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

const getTransactionStatus = async (payId) => {
  return new Promise((resolve, reject) => {
    paypal.payment.get(payId, function (error, payment) {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

const webHookCallback = async (req, res) => {
  return new Promise((resolve, reject) => {
    paypal.notification.webhookEvent.verify(
      req.headers,
      req.body,
      function (error, response) {
        if (error) {
          reject(error);
        }

        // Get the transaction details
        paypal.payment.get(req.body.id, function (error, payment) {
          if (error) {
            reject(error);
          }

          // Save the transaction details to your database
          resolve(payment);
        });
      }
    );
  });
};

module.exports = {
  paypal,
  validateCardInformation,
  createPayment,
  getTransactionStatus,
  webHookCallback,
};

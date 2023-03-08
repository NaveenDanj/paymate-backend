const express = require("express");
const router = express.Router();

const AuthController = require("../Controllers/AuthController");
const WalletController = require("../Controllers/App/WalletController");
const AuthRequired = require("../Middlewares/AuthRequired");
const PaymentController = require("../Controllers/App/PaymentController");
const TransactionController = require("../Controllers/App/TransactionController");

router.get("/", (req, res) => {
  return res.json({ message: "Paymate API v1.0.0" });
});

// router.use("/auth", AuthRequired("User"), AuthController);
router.use("/client/auth", AuthController);
router.use("/wallet", WalletController);
router.use("/payments", PaymentController);
router.use("/transaction", TransactionController);

module.exports = router;

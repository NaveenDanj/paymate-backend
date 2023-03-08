const express = require("express");
const router = express.Router();
const Joi = require("joi");

router.post("/fund-transfer");
router.post("/qr-pay");

router.post("/qr-init-payment");
router.post("/get-user-transactions");

router.post("/token-url-init-payment");
router.post("/token-url-init-payment");

router.post("/get-transaction-status");

module.exports = router;

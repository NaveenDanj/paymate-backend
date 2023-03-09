const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentCallBackLogSchema = new Schema(
  {
    callBackObject: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentCallBackLog = mongoose.model(
  "PaymentCallBackLog",
  PaymentCallBackLogSchema
);
module.exports = PaymentCallBackLog;

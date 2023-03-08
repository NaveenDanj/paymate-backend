const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    type: {
      type: String,
      required: true,
      enum: ["topup"],
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "cancelled", "failed"],
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentObject: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;

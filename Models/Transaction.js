const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    fromWalletId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Wallet",
    },

    type: {
      type: String,
      default: "created",
      enum: [
        "fund-transfer",
        "instance-pay",
        "qr-pay",
        "near-pay",
        "token-pay",
      ],
    },

    userRemarks: {
      type: String,
      required: true,
    },

    receiverRemarks: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "created",
      enum: [
        "created",
        "quied",
        "processing",
        "pending",
        "success",
        "failed",
        "bloked",
      ],
    },

    amount: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true, strict: false }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;

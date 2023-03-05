const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
    },

    activated: {
      type: Boolean,
      default: true,
    },

    Balance: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", WalletSchema);
module.exports = Wallet;

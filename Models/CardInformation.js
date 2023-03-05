const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardInformationSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Wallet",
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    cardHolderName: {
      type: String,
      required: true,
    },

    cardNumber: {
      type: String,
      required: true,
    },

    expireDate: {
      type: String,
      required: true,
    },

    cvv: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CardInformation = mongoose.model(
  "CardInformation",
  CardInformationSchema
);
module.exports = CardInformation;

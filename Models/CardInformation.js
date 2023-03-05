const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardInformationSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },

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

    cardId: {
      type: String,
      required: true,
    },

    cardHolderName: {
      type: String,
      required: true,
    },

    cardNumber: {
      type: String,
      required: true,
    },

    expireYear: {
      type: String,
      required: true,
    },

    expireMonth: {
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

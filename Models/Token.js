const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    id: {
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
      enum: ["auth", "activation", "password-reset", "password-reset-act"],
    },

    deviceType: {
      type: String,
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    IPAddress: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: "30m",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Token", TokenSchema);
module.exports = User;

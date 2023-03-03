const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },

    type: {
      type: String,
      required: true,
      enum: ["auth"],
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Token", TokenSchema);
module.exports = User;

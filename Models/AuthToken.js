const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthTokenSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
      expires: "1h",
    },
  },
  { timestamps: true }
);

const AuthToken = mongoose.model("AuthToken", AuthTokenSchema);
module.exports = AuthToken;

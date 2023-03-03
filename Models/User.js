const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },

    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    activated: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;

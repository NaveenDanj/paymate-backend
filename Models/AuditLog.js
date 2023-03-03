const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },

    type: {
      type: String,
      required: true,
    },

    IPAddress: {
      type: String,
      required: true,
    },

    request: {
      type: String,
    },

    response: {
      type: String,
    },

    headers: {
      type: String,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
module.exports = AuditLog;

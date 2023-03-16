const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConstanceSchema = new Schema({}, { timestamps: true, strict: false });

const Constance = mongoose.model("Constance", ConstanceSchema);
module.exports = Constance;

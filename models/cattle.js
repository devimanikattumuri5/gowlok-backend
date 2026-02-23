const mongoose = require("mongoose");

const CattleSchema = new mongoose.Schema({
  name: String,
  tagNumber: String,
  breed: String,
  gender: String,
  weight: Number,
  dateOfBirth: Date,
  isPregnant: Boolean,
}, { timestamps: true });

module.exports = mongoose.model("Cattle", CattleSchema);

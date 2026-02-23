const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,   // Prevent duplicate accounts
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false  // Worker must be approved by Admin
  },
  createdAt: {
    type: Date,
    default: Date.now // Stores registration time
  }
});

module.exports = mongoose.model("Worker", workerSchema);

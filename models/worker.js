const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    workerId: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: String,
    mobile: String,
    address: String,
    aadhar: String,
    emergency: String,
    salary: String,
    dob: Date,
    joiningDate: Date,

    approved: {
      type: Boolean,
      default: false,
    },

    firstLogin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", workerSchema);
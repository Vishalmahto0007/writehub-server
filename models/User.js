// models/User.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    gender: String,
    dob: Date,
    avatar: String,
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetCode: String,
    resetCodeExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

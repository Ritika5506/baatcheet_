const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String }, // Allow null/undefined for social auth users
  password: { type: String },
  provider: { type: String }, // google, facebook, linkedin, local
  providerId: { type: String },
  googleId: { type: String },
  facebookId: { type: String },
  linkedInId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "instructor", "institution_rep"] },
  institutionId: String,
  // userCode: { type: String, unique: true },
});

module.exports = mongoose.model("User", userSchema);
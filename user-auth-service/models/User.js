const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,  // 👈 This line is crucial
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "instructor", "institution_rep"] },
  institutionId: String,
  userCode: String,
  googleId: { type: String, unique: true, sparse: true },
  gmail: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model("User", userSchema);

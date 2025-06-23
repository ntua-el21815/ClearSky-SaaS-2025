// src/models/reviewModel.js
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "instructor", "institution_rep"] },
  institutionId: String,
});
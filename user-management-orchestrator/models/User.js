const mongoose = require("mongoose");

const courseInfoSchema = new mongoose.Schema(
  {
    courseId:  { type: String,  required: true },
    courseName:     { type: String, required: true },
    academicPeriod:  { type: String,  required: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "instructor", "institution_rep"] },
  institutionId: String,
  courses: [courseInfoSchema]
});

module.exports = mongoose.model("User", userSchema);
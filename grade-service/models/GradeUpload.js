const mongoose = require('mongoose');

const gradeUploadSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  academicPeriod:{ type: String, required: true },
  courseName:{ type: String, required: true },
  courseId:  { type: String, required: true },
  ratingScale:{ String },
  final: { type: Boolean },
  instructorId: { type: String, required: true },
  institutionId: {type: String},
  weights: {
    type: Map,
    of: Number
  },
  grades: [
    {
      "studentId": String,
      "studentName": String,
      "academicalEmail": String,
      "grade": Number,
      responses: {
        type: Map,
        of: Number
      }
    }
  ]
});

module.exports = mongoose.model('GradeUpload', gradeUploadSchema);
const mongoose = require('mongoose');

const courseStatisticsSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  institutionId: { type: String, required: true },        // ✅ Keep
  academicPeriod: { type: String, required: true },       // ✅ Replace gradeSheetId
  averageGrade: Number,
  medianGrade: Number,
  standardDeviation: Number,
  numberOfStudents: Number,
  numberOfPasses: Number,
  numberOfFails: Number,
  finalGradeDistribution: Object,
  questionDistributionsRaw: Object,
  questionDistributionsNormalized: Object,
  calculatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseStatistics', courseStatisticsSchema);

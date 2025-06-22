const mongoose = require('mongoose');

const courseStatisticsSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  gradeSheetId: { type: String, required: true },
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

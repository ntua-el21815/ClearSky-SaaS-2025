const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for Credit Usage Log
const creditUsageLogSchema = new Schema({
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  creditsUsed: {
    type: Number,
    required: true
  },
  operation: {
    type: String,
    required: true
  },
  courseId: {
    type: String
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CreditUsageLog', creditUsageLogSchema);
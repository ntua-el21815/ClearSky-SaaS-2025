const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for Institution Credits
const institutionCreditSchema = new Schema({
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  totalCredits: {
    type: Number,
    required: true,
    default: 0
  },
  usedCredits: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InstitutionCredit', institutionCreditSchema);
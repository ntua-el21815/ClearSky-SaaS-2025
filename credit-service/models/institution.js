const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for Institution
// This db should be synced with Instituion/User Service.
const institutionSchema = new Schema({
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Institution', institutionSchema);
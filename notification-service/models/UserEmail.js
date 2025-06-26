// models/UserEmail.js
const mongoose = require('mongoose');

const userEmailSchema = new mongoose.Schema({
  studentCode: { type: String, required: true, unique: true },
  email: { type: String, required: true }
});

module.exports = mongoose.model('UserEmail', userEmailSchema);

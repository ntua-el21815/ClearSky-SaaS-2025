// db.js
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/notifications';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

module.exports = connectDB;

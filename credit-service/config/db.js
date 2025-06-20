const mongoose = require('mongoose');

const MONGODB_URI= process.env.MONGODB_URI

// Connect to MongoDB
const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase
};
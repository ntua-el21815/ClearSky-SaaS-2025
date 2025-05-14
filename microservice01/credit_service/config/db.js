const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();
// Check if the environment variables are set
if (!process.env.MONGO_USER || !process.env.MONGO_PASSWORD) {
  console.error('MongoDB credentials are not set in environment variables');
  process.exit(1);
}

// Configure a user and password for MongoDB
const mongo_username = process.env.MONGO_USER;
const mongo_password = process.env.MONGO_PASSWORD;

const MONGODB_URI= `mongodb://${mongo_username}:${mongo_password}@mongodb:27017/institutionCredits?authSource=admin`;

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
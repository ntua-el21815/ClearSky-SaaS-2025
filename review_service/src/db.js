import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

if (!process.env.MONGO_USER || !process.env.MONGO_PASSWORD) {
  console.error('MongoDB credentials are not set in environment variables');
  process.exit(1);
}

const mongo_username = process.env.MONGO_USER;
const mongo_password = process.env.MONGO_PASSWORD;

const MONGODB_URI = `mongodb://${mongo_username}:${mongo_password}@mongodb:27017/reviewDB?authSource=admin`;

export const connectDatabase = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', MONGODB_URI); // Debug log
    console.log('Username:', mongo_username); // Debug log
    await mongoose.connect(MONGODB_URI); // Removed deprecated options
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDatabase = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', MONGODB_URI); // Debug log
    await mongoose.connect(MONGODB_URI); 
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
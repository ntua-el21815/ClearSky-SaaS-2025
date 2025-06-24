// src/app.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';
import { connectDatabase } from './db.js'; // Import connectDatabase

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8400;

// Middleware
app.use(express.json());

// Routes
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Review Service is healthy');
});

const startServer = async () => {
  try {
    await connectDatabase(); // Use connectDatabase from db.js
    app.listen(PORT, () => {
      console.log(`Review Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; // For potential testing
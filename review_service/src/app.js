// src/app.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8400;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());

// Database Connection
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit if cannot connect to DB
});

// Routes
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Review Service is healthy');
});

app.listen(PORT, () => {
  console.log(`Review Service listening on port ${PORT}`);
});

export default app; // For potential testing
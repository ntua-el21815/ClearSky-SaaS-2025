// src/models/reviewModel.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const reviewSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 }, // Using UUID for id
  studentCode: { type: String, required: true }, // UUID
  courseId: { type: String, required: true }, // UUID
  academicPeriod: {type: String, required: true},
  institutionId: {type: String, required: true},
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'RESOLVED_APPROVED', 'RESOLVED_REJECTED', 'ACTION_REQUIRED'],
    default: 'PENDING',
  },
  requestedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  instructorResponse: { type: String },
  reviewedGrade: { type: Number }, // Matches "ReviewedGrade: Double" [cite: 5]
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
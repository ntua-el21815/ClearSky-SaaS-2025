const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    courseId:      { type: String, required: true },          
    name:          { type: String, required: true },
    academicPeriod:{ type: String },
    instructorId:  { type: String },
    institutionId: { type: String, ref: 'Institution', required: true },
    //status:        { type: String, enum: ['active', 'archived'], default: 'active' }
  },
  {
    timestamps: true         
  }
);

CourseSchema.index({ institutionId: 1, courseId: 1  }, { unique: true });

module.exports = mongoose.model('Course', CourseSchema);


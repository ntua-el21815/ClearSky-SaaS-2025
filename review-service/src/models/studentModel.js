// src/models/reviewModel.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    profileId: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    institutionId: {
        type: String,
        required: true
    }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
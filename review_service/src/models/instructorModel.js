import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    profileId: {
        type: String,
        required: true
    },
    institutionId: {
        type: String,
        required: true
    }
});

const Instructor = mongoose.model('Instructor', instructorSchema);

export default Instructor;
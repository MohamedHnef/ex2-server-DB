const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    year: { type: Number, required: true },
    registeredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    pointsTracker: { type: Number, default: 0 },
});

module.exports = mongoose.model('Student', studentSchema);

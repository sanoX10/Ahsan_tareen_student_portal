// models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    credits: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
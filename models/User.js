// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student'], // User can be either 'admin' or 'student'
        default: 'student'
    },
    studentId: { // Only applicable if role is 'student'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        unique: true,
        sparse: true // Allows null values but enforces uniqueness for non-null values
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
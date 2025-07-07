// models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentUniqueId: { // The ID assigned by the admin for student login
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    contactNumber: {
        type: String
    },
    // Reference to the User model for login purposes
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true // Allows null but unique for non-null
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
// models/Grade.js
const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100 // Assuming scores are out of 100
    },
    gradeLetter: { // Automatically calculated or assigned
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'N/A'],
        default: 'N/A'
    }
}, { timestamps: true });

// Ensure unique combination of student and course for grades
GradeSchema.index({ student: 1, course: 1 }, { unique: true });

// Pre-save hook to calculate grade letter based on score
GradeSchema.pre('save', function(next) {
    if (this.isModified('score') || this.isNew) {
        if (this.score >= 90) this.gradeLetter = 'A+';
        else if (this.score >= 85) this.gradeLetter = 'A';
        else if (this.score >= 80) this.gradeLetter = 'A-';
        else if (this.score >= 75) this.gradeLetter = 'B+';
        else if (this.score >= 70) this.gradeLetter = 'B';
        else if (this.score >= 65) this.gradeLetter = 'B-';
        else if (this.score >= 60) this.gradeLetter = 'C+';
        else if (this.score >= 55) this.gradeLetter = 'C';
        else if (this.score >= 50) this.gradeLetter = 'C-';
        else if (this.score >= 40) this.gradeLetter = 'D';
        else this.gradeLetter = 'F';
    }
    next();
});

module.exports = mongoose.model('Grade', GradeSchema);

// routes/student.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const bcrypt = require('bcryptjs'); // Needed for password hashing
const { check, validationResult } = require('express-validator'); // For input validation

// @route   GET /api/student/profile
// @desc    Get logged-in student's profile details
// @access  Private (Student only)
router.get('/profile', verifyToken, authorizeRole(['student']), async (req, res) => {
    console.log('Backend: GET /api/student/profile hit. User ID:', req.user.studentId);
    try {
        const student = await Student.findById(req.user.studentId).select('-password'); // Exclude password from the returned profile

        if (!student) {
            console.log('Backend: Student profile not found for ID:', req.user.studentId);
            return res.status(404).json({ msg: 'Student profile not found' });
        }
        console.log('Backend: Student profile found:', student.name);
        res.json(student);
    } catch (err) {
        console.error('Backend: Error in GET /api/student/profile:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/student/profile
// @desc    Update logged-in student's profile details
// @access  Private (Student only)
router.put(
    '/profile',
    verifyToken,
    authorizeRole(['student']),
    [
        // Validation rules for optional fields
        check('name', 'Name must be a string and not empty').optional().isString().notEmpty().trim(),
        check('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
        check('dateOfBirth', 'Invalid date of birth format').optional().isDate(),
        check('contactNumber', 'Contact number is invalid').optional().isMobilePhone('any'), // 'any' for international
        check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
    ],
    async (req, res) => {
        console.log('Backend: PUT /api/student/profile hit. User ID:', req.user.studentId);
        console.log('Backend: Request Body:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Backend: Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, dateOfBirth, address, contactNumber, password } = req.body;

        // Build a profile fields object for update
        const profileFields = {};
        if (name !== undefined) profileFields.name = name; // Check for undefined to allow empty string if client sends it
        if (email !== undefined) profileFields.email = email;
        if (dateOfBirth !== undefined) profileFields.dateOfBirth = dateOfBirth;
        if (address !== undefined) profileFields.address = address;
        if (contactNumber !== undefined) profileFields.contactNumber = contactNumber;

        try {
            let student = await Student.findById(req.user.studentId);

            if (!student) {
                console.log('Backend: Student not found for update (ID:', req.user.studentId + ')');
                return res.status(404).json({ msg: 'Student not found' });
            }

            // Handle password update if provided and not empty
            if (password) {
                 console.log('Backend: Hashing new password...');
                const salt = await bcrypt.genSalt(10);
                profileFields.password = await bcrypt.hash(password, salt);
            }

            console.log('Backend: Fields to update:', profileFields);

            // Update student profile in the database
            student = await Student.findByIdAndUpdate(
                req.user.studentId,
                { $set: profileFields },
                { new: true, runValidators: true } // `new: true` returns the updated document; `runValidators: true` ensures schema validators run
            ).select('-password'); // Exclude password from the response

            if (!student) {
                // This case is unlikely if findById found it, but good for robustness
                console.error('Backend: Student.findByIdAndUpdate returned null for ID:', req.user.studentId);
                return res.status(500).json({ msg: 'Error updating student profile.' });
            }

            console.log('Backend: Student profile updated successfully for:', student.name);
            res.json(student); // Send back the updated student object

        } catch (err) {
            console.error('Backend: Error in PUT /api/student/profile:', err.message);
            // Specific handling for common Mongoose errors
            if (err.name === 'ValidationError') {
                return res.status(400).json({ errors: [{ msg: err.message }] }); // Consistent with express-validator error format
            } else if (err.code === 11000) { // Duplicate key error (e.g., duplicate email if unique)
                return res.status(400).json({ errors: [{ msg: 'Email already exists. Please use a different email.' }] });
            }
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/student/grades
// @desc    Get grades for the logged-in student
// @access  Private (Student only)
router.get('/grades', verifyToken, authorizeRole(['student']), async (req, res) => {
    console.log('Backend: GET /api/student/grades hit. User ID:', req.user.studentId);
    try {
        const grades = await Grade.find({ student: req.user.studentId })
            .populate('course', 'courseCode courseName credits');

        console.log('Backend: Grades found:', grades.length);
        res.json(grades);
    } catch (err) {
        console.error('Backend: Error in GET /api/student/grades:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const dotenv = require('dotenv');

dotenv.config();

// @route   POST /api/auth/register
// @desc    Register a new user (primarily for admin initial setup, students are created by admin)
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            password,
            role: role || 'student' // Default to student if role not provided
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            // If user not found by username, try finding by studentUniqueId
            const student = await Student.findOne({ studentUniqueId: username });
            if (student && student.user) {
                user = await User.findById(student.user);
            }
            if (!user) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                studentId: user.studentId // Include studentId if available
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, userId: user.id, studentId: user.studentId });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

/*
Explanation:
- `routes/auth.js` has been re-verified. All route paths are static strings (`/register`, `/login`), and the `req`, `res` parameters are in the correct order. There are no dynamic parameters (`:id`) in these routes that could cause the `path-to-regexp` error.
*/

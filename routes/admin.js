// routes/admin.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const bcrypt = require('bcryptjs');

// --- Student Management ---

// @route   POST /api/admin/students
// @desc    Create a new student and their login account
// @access  Private (Admin only)
router.post('/students', verifyToken, authorizeRole(['admin']), async (req, res) => {
    const { studentUniqueId, name, email, dateOfBirth, address, contactNumber, password } = req.body;

    try {
        // Check if studentUniqueId or email already exists
        let student = await Student.findOne({ $or: [{ studentUniqueId }, { email }] });
        if (student) {
            return res.status(400).json({ msg: 'Student with this ID or Email already exists' });
        }

        // Check if a user with this username (studentUniqueId) already exists
        let userExists = await User.findOne({ username: studentUniqueId });
        if (userExists) {
            return res.status(400).json({ msg: 'Login username (student ID) already taken' });
        }

        // Create new student profile
        student = new Student({
            studentUniqueId,
            name,
            email,
            dateOfBirth,
            address,
            contactNumber
        });

        // Hash the password for the student's login account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user account for the student
        const user = new User({
            username: studentUniqueId, // Student's unique ID is their login username
            password: hashedPassword,
            role: 'student'
        });

        // Link student and user
        student.user = user._id;
        user.studentId = student._id;

        await student.save();
        await user.save();

        res.status(201).json({ msg: 'Student and login account created successfully', student });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin only)
router.get('/students', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'username role'); // Populate user details
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/students/:id
// @desc    Get student by ID
// @access  Private (Admin only)
router.get('/students/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'username role');
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/admin/students/:id
// @desc    Update student details and optionally their login password
// @access  Private (Admin only)
router.put('/students/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    const { name, email, dateOfBirth, address, contactNumber, password } = req.body;
    const studentId = req.params.id;

    try {
        let student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Update student profile details
        student.name = name || student.name;
        student.email = email || student.email;
        student.dateOfBirth = dateOfBirth || student.dateOfBirth;
        student.address = address || student.address;
        student.contactNumber = contactNumber || student.contactNumber;

        await student.save();

        // If a new password is provided, update the associated user account
        if (password) {
            const user = await User.findById(student.user);
            if (user) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
            }
        }

        res.json({ msg: 'Student updated successfully', student });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/admin/students/:id
// @desc    Delete a student and their associated login account and grades
// @access  Private (Admin only)
router.delete('/students/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Delete associated user account
        if (student.user) {
            await User.findByIdAndDelete(student.user);
        }

        // Delete associated grades
        await Grade.deleteMany({ student: student._id });

        // Delete the student profile
        await student.deleteOne();

        res.json({ msg: 'Student, associated user, and grades deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- Course Management ---

// @route   POST /api/admin/courses
// @desc    Create a new course
// @access  Private (Admin only)
router.post('/courses', verifyToken, authorizeRole(['admin']), async (req, res) => {
    const { courseCode, courseName, description, credits } = req.body;

    try {
        let course = await Course.findOne({ courseCode });
        if (course) {
            return res.status(400).json({ msg: 'Course with this code already exists' });
        }

        course = new Course({
            courseCode,
            courseName,
            description,
            credits
        });

        await course.save();
        res.status(201).json({ msg: 'Course created successfully', course });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/courses
// @desc    Get all courses
// @access  Private (Admin only)
router.get('/courses', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update a course
// @access  Private (Admin only)
router.put('/courses/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    const { courseName, description, credits } = req.body;

    try {
        let course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        course.courseName = courseName || course.courseName;
        course.description = description || course.description;
        course.credits = credits || course.credits;

        await course.save();
        res.json({ msg: 'Course updated successfully', course });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete a course
// @access  Private (Admin only)
router.delete('/courses/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Also delete any grades associated with this course
        await Grade.deleteMany({ course: course._id });

        await course.deleteOne();
        res.json({ msg: 'Course and associated grades deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- Grade Management ---

// @route   POST /api/admin/grades
// @desc    Upload/Assign a grade for a student in a course
// @access  Private (Admin only)
router.post('/grades', verifyToken, authorizeRole(['admin']), async (req, res) => {
    const { studentId, courseId, score } = req.body;

    try {
        // Find student and course by their IDs
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Check if a grade for this student and course already exists
        let grade = await Grade.findOne({ student: student._id, course: course._id });

        if (grade) {
            // If exists, update it
            grade.score = score;
            await grade.save(); // The pre-save hook will update gradeLetter
            res.json({ msg: 'Grade updated successfully', grade });
        } else {
            // Otherwise, create a new grade
            grade = new Grade({
                student: student._id,
                course: course._id,
                score
            });
            await grade.save();
            res.status(201).json({ msg: 'Grade assigned successfully', grade });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/grades
// @desc    Get all grades (with student and course details populated)
// @access  Private (Admin only)
router.get('/grades', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const grades = await Grade.find()
            .populate('student', 'studentUniqueId name email')
            .populate('course', 'courseCode courseName');
        res.json(grades);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/admin/grades/:id
// @desc    Delete a grade
// @access  Private (Admin only)
router.delete('/grades/:id', verifyToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ msg: 'Grade not found' });
        }
        await grade.deleteOne();
        res.json({ msg: 'Grade deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

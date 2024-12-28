const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const { JWT_SECRET } = require('../constants');

exports.authController = {
    async signup(req, res) {
        try {
            const { userType, ...userData } = req.body;

            // Validate userType
            if (!['student', 'faculty'].includes(userType)) {
                return res.status(400).json({ message: 'Invalid user type' });
            }

            // Hash password
            userData.password = await bcrypt.hash(userData.password, 10);

            let user;
            if (userType === 'student') {
                // Generate a unique studentId
                const maxId = (await Student.find().sort({ studentId: -1 }).limit(1))[0]?.studentId || 0;
                userData.studentId = maxId + 1;

                user = new Student(userData);
            } else {
                const maxId = (await Faculty.find().sort({ facultyId: -1 }).limit(1))[0]?.facultyId || 0;
                userData.facultyId = maxId + 1;

                user = new Faculty(userData);
            }

            await user.save();
            res.status(201).json({ message: `${userType} created successfully`, user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { userType, email, password } = req.body;

            if (!['student', 'faculty'].includes(userType)) {
                return res.status(400).json({ message: 'Invalid user type' });
            }

            let user;
            if (userType === 'student') {
                user = await Student.findOne({ email });
            } else {
                user = await Faculty.findOne({ email });
            }

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user._id, userType }, JWT_SECRET, { expiresIn: '10m' });

            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

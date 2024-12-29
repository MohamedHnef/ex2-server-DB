const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const Faculty = require('../models/facultyModel');
const { JWT_SECRET } = require('../constants');
const logger = require('../utils/logger');

exports.authController = {
    async signup(req, res) {
        try {
            const { userType, ...userData } = req.body;
            logger.info(`Signup request received for userType: ${userType}`);

            if (!isValidUserType(userType)) {
                logger.warn(`Invalid userType: ${userType}`);
                return res.status(400).json({ message: 'Invalid user type' });
            }

            userData.password = await hashPassword(userData.password);
            logger.info('Password hashed successfully');

            const user = await createUser(userType, userData);
            logger.info(`${userType} created with ID: ${user._id}`);

            await user.save();
            logger.info(`${userType} saved to database successfully`);

            res.status(201).json({ message: `${userType} created successfully`, user });
        } catch (error) {
            logger.error(`Error during signup: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },

    async login(req, res) {
        try {
            const { userType, email, password } = req.body;
            logger.info(`Login request received for userType: ${userType}, email: ${email}`);

            if (!isValidUserType(userType)) {
                logger.warn(`Invalid userType during login: ${userType}`);
                return res.status(400).json({ message: 'Invalid user type' });
            }

            const user = await findUserByEmail(userType, email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                logger.warn(`Invalid email or password for email: ${email}`);
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = generateToken(user);
            logger.info(`Login successful for userType: ${userType}, email: ${email}`);

            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            logger.error(`Error during login: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

const isValidUserType = (userType) => ['student', 'faculty'].includes(userType);

const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

const createUser = async (userType, userData) => {
    if (userType === 'student') {
        const maxId = (await Student.find().sort({ studentId: -1 }).limit(1))[0]?.studentId || 0;
        userData.studentId = maxId + 1;
        return new Student(userData);
    } else {
        const maxId = (await Faculty.find().sort({ facultyId: -1 }).limit(1))[0]?.facultyId || 0;
        userData.facultyId = maxId + 1;
        return new Faculty(userData);
    }
};

const findUserByEmail = async (userType, email) => {
    if (userType === 'student') {
        return Student.findOne({ email });
    }
    return Faculty.findOne({ email });
};

const generateToken = (user) => {
    return jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '10m' });
};

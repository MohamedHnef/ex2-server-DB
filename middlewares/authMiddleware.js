const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants');
const logger = require('../utils/logger');

exports.authMiddleware = {
    verifyToken(req, res, next) {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = decoded;
            next();
        });
    },

    isFaculty(req, res, next) {
        if (req.user.userType !== 'faculty') {
            logger.warn(`Access denied: User ${req.user.id} attempted to access faculty-only resource`);
            return res.status(403).json({ message: 'Access denied Faculty only.' });
        }
        next();
    },

    isStudent(req, res, next) {
        if (req.user.userType !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    },

    ownsResource(req, res, next) {
        const tokenStudentId = req.user.id; 
        req.body.studentId = tokenStudentId; 
        next();
    }
    
};

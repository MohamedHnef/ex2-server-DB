const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants');

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
        const userId = req.user.id; 
        const { studentId } = req.body;
    
        if (userId !== studentId) {
            logger.warn(`Access denied: User ${userId} tried to act on behalf of student ${studentId}`);
            return res.status(403).json({ message: 'Access denied. You can only manage your own courses.' });
        }
    
        next();
    },
    
};

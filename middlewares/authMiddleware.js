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
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    },

    isStudent(req, res, next) {
        if (req.user.userType !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    },
};

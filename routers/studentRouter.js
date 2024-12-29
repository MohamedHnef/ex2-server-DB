const express = require('express');
const { studentController } = require('../controllers/studentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', authMiddleware.verifyToken, authMiddleware.isStudent, authMiddleware.ownsResource, studentController.registerForCourse);
router.post('/deregister', authMiddleware.verifyToken, authMiddleware.isStudent, authMiddleware.ownsResource, studentController.deregisterFromCourse);
router.get('/my-courses', authMiddleware.verifyToken, authMiddleware.isStudent, studentController.getRegisteredCourses);

module.exports = { studentRouter: router };

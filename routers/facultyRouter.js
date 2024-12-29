const express = require('express');
const { facultyController } = require('../controllers/facultyController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware.verifyToken, authMiddleware.isFaculty, facultyController.getAllCoursesAndStudents);
router.get('/:courseId', authMiddleware.verifyToken, authMiddleware.isFaculty, facultyController.getCourseAndStudents);

module.exports = { facultyRouter: router };

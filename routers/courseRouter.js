const express = require('express');
const { courseController } = require('../controllers/courseController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.addCourse);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.updateCourse);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.deleteCourse);

router.get('/', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.getAllCoursesAndStudents);
router.get('/:id/students', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.getCourseAndStudents);

router.post('/:id/register', authMiddleware.verifyToken, authMiddleware.isStudent, courseController.registerForCourse);
router.delete('/:id/register', authMiddleware.verifyToken, authMiddleware.isStudent, courseController.deregisterFromCourse);

module.exports = { courseRouter: router };

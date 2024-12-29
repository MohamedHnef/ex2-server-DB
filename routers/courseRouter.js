const express = require('express');
const { courseController } = require('../controllers/courseController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.addCourse);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.updateCourse);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.deleteCourse);
router.get('/', authMiddleware.verifyToken, authMiddleware.isFaculty, courseController.getAllCourses);

module.exports = { courseRouter: router };

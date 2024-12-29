const express = require('express');
const { studentController } = require('../controllers/studentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:id/courses', authMiddleware.verifyToken, authMiddleware.isStudent, studentController.getRegisteredCourses);

module.exports = { studentRouter: router };

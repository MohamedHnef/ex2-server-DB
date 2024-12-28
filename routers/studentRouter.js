const express = require('express');
const { studentController } = require('../controllers/studentController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudent);
router.post('/', studentController.addStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/register', authMiddleware.verifyToken, authMiddleware.isStudent, studentController.registerForCourse);



module.exports = { studentRouter: router };

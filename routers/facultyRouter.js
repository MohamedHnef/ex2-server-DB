const express = require('express');
const { facultyController } = require('../controllers/facultyController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/', authMiddleware.verifyToken, authMiddleware.isFaculty, facultyController.getAllFaculty);
router.get('/:id', authMiddleware.verifyToken, authMiddleware.isFaculty, facultyController.getFaculty);

module.exports = { facultyRouter: router };

const express = require('express');
const { facultyController } = require('../controllers/facultyController');
const router = express.Router();

router.get('/', facultyController.getAllFaculty);
router.get('/:id', facultyController.getFaculty);
router.post('/', facultyController.addFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = { facultyRouter: router };

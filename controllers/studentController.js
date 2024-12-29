const Student = require('../models/studentModel');
const logger = require('../utils/logger');

exports.studentController = {
    async getRegisteredCourses(req, res) {
        try {
            const { id } = req.user; 
            logger.info(`Fetching registered courses for student ID: ${id}`);

            const student = await Student.findOne({ _id: id }).populate({
                path: 'registeredCourses',
                select: 'courseId name instructor creditPoints',
            });

            if (!student) {
                logger.warn(`Student not found with ID: ${id}`);
                return res.status(404).json({ message: 'Student not found' });
            }

            res.status(200).json({ registeredCourses: student.registeredCourses });
        } catch (error) {
            logger.error(`Error fetching registered courses: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

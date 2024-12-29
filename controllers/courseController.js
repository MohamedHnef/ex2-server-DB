const Course = require('../models/courseModel');
const logger = require('../utils/logger');

exports.courseController = {
    async addCourse(req, res) {
        try {
            logger.info('Adding a new course');
            const course = new Course(req.body);
            await course.save();
            logger.info(`Added course successfully: ${course.name}`);
            res.status(201).json(course);
        } catch (error) {
            logger.error(`Error adding course: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },

    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Updating course with ID: ${id}`);
            const course = await Course.findOneAndUpdate({ courseId: id }, req.body, { new: true });
            if (!course) {
                logger.warn(`Course not found for update with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }
            logger.info(`Updated course successfully: ${course.name}`);
            res.status(200).json(course);
        } catch (error) {
            logger.error(`Error updating course: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },

    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Deleting course with ID: ${id}`);
            const course = await Course.findOneAndDelete({ courseId: id });
            if (!course) {
                logger.warn(`Course not found for deletion with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }
            logger.info(`Deleted course successfully: ${course.name}`);
            res.status(200).json({ message: 'Course deleted successfully' });
        } catch (error) {
            logger.error(`Error deleting course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

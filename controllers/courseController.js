const Course = require('../models/courseModel');
const logger = require('../utils/logger');

exports.courseController = {
    // Add a new course
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

    // Update an existing course
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

    // Delete a course
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

    // Get all courses
    async getAllCourses(req, res) {
        try {
            logger.info('Fetching all courses');
            const courses = await Course.find().populate('enrolledStudents');
            logger.info('Fetched all courses successfully');
            res.status(200).json(courses);
        } catch (error) {
            logger.error(`Error fetching courses: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    // Get registration status for a course
    async getCourseRegistrationStatus(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Fetching registration status for course with ID: ${id}`);
            const course = await Course.findOne({ courseId: id }).populate('enrolledStudents');
            if (!course) {
                logger.warn(`Course not found with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            const registrationStatus = {
                courseName: course.name,
                totalStudents: course.enrolledStudents.length,
                students: course.enrolledStudents.map(student => ({
                    id: student.studentId,
                    name: student.name,
                })),
            };

            logger.info(`Fetched registration status for course with ID: ${id}`);
            res.status(200).json(registrationStatus);
        } catch (error) {
            logger.error(`Error fetching registration status: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

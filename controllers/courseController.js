const Course = require('../models/courseModel');

exports.courseController = {
    async getAllCourses(req, res) {
        try {
            const courses = await Course.find().populate('enrolledStudents');
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getCourse(req, res) {
        try {
            const course = await Course.findOne({ courseId: req.params.id }).populate('enrolledStudents');
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addCourse(req, res) {
        try {
            const course = new Course(req.body);
            await course.save();
            res.status(201).json(course);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updateCourse(req, res) {
        try {
            const course = await Course.findOneAndUpdate({ courseId: req.params.id }, req.body, { new: true });
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json(course);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deleteCourse(req, res) {
        try {
            const course = await Course.findOneAndDelete({ courseId: req.params.id });
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json({ message: 'Course deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

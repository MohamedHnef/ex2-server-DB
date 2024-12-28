const Student = require('../models/studentModel');

exports.studentController = {
    async getAllStudents(req, res) {
        try {
            const students = await Student.find().populate('registeredCourses');
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStudent(req, res) {
        try {
            const student = await Student.findOne({ studentId: req.params.id }).populate('registeredCourses');
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json(student);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addStudent(req, res) {
        try {
            const student = new Student(req.body);
            await student.save();
            res.status(201).json(student);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updateStudent(req, res) {
        try {
            const student = await Student.findOneAndUpdate({ studentId: req.params.id }, req.body, { new: true });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json(student);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deleteStudent(req, res) {
        try {
            const student = await Student.findOneAndDelete({ studentId: req.params.id });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

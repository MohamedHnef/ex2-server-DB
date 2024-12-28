const Student = require('../models/studentModel');
const Course = require('../models/courseModel');

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

    async registerForCourse(req, res) {
        try {
            const { studentId, courseId } = req.body;

            const student = await exports.studentController.findStudent(studentId, res);
            if (!student) return;

            const course = await exports.studentController.findCourse(courseId, res);
            if (!course) return;

            if (exports.studentController.isAlreadyRegistered(student, course)) {
                return res.status(400).json({ message: 'Student is already registered for this course' });
            }

            if (exports.studentController.isCourseFull(course)) {
                return res.status(400).json({ message: 'Course is full' });
            }

            if (exports.studentController.exceedsCreditLimit(student, course)) {
                return res.status(400).json({ message: 'Registration exceeds the credit limit of 20' });
            }

            await exports.studentController.registerStudentToCourse(student, course);

            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async findStudent(studentId, res) {
        const student = await Student.findOne({ studentId }).populate('registeredCourses');
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
        }
        return student;
    },

    async findCourse(courseId, res) {
        const course = await Course.findOne({ courseId });
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
        }
        return course;
    },

    isAlreadyRegistered(student, course) {
        return student.registeredCourses.some(c => c._id.equals(course._id));
    },

    isCourseFull(course) {
        return course.enrolledStudents.length >= course.maxStudents;
    },

    exceedsCreditLimit(student, course) {
        const totalCredits = student.registeredCourses.reduce((sum, c) => sum + c.creditPoints, 0) + course.creditPoints;
        return totalCredits > 20;
    },

    async registerStudentToCourse(student, course) {
        student.registeredCourses.push(course._id);
        course.enrolledStudents.push(student._id);
        await student.save();
        await course.save();
    },
};

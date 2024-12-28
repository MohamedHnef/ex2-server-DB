const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const logger = require('../utils/logger');

exports.studentController = {
    async getAllStudents(req, res) {
        try {
            logger.info('Fetching all students');
            const students = await Student.find().populate('registeredCourses');
            logger.info('Fetched all students successfully');
            res.status(200).json(students);
        } catch (error) {
            logger.error(`Error fetching students: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    async getStudent(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Fetching student with ID: ${id}`);
            const student = await Student.findOne({ studentId: id }).populate('registeredCourses');
            if (!student) {
                logger.warn(`Student not found with ID: ${id}`);
                return res.status(404).json({ message: 'Student not found' });
            }
            logger.info(`Fetched student successfully: ${student.name}`);
            res.status(200).json(student);
        } catch (error) {
            logger.error(`Error fetching student: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    async addStudent(req, res) {
        try {
            logger.info('Adding a new student');
            const student = new Student(req.body);
            await student.save();
            logger.info(`Added student successfully: ${student.name}`);
            res.status(201).json(student);
        } catch (error) {
            logger.error(`Error adding student: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },
    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Updating student with ID: ${id}`);
            const student = await Student.findOneAndUpdate({ studentId: id }, req.body, { new: true });
            if (!student) {
                logger.warn(`Student not found for update with ID: ${id}`);
                return res.status(404).json({ message: 'Student not found' });
            }
            logger.info(`Updated student successfully: ${student.name}`);
            res.status(200).json(student);
        } catch (error) {
            logger.error(`Error updating student: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },
    async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Deleting student with ID: ${id}`);
            const student = await Student.findOneAndDelete({ studentId: id });
            if (!student) {
                logger.warn(`Student not found for deletion with ID: ${id}`);
                return res.status(404).json({ message: 'Student not found' });
            }
            logger.info(`Deleted student successfully: ${student.name}`);
            res.status(200).json({ message: 'Student deleted successfully' });
        } catch (error) {
            logger.error(`Error deleting student: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async registerForCourse(req, res) {
        try {
            const { studentId, courseId } = req.body;
            logger.info(`Registering student ${studentId} for course ${courseId}`);

            const student = await exports.studentController.findStudent(studentId, res);
            if (!student) return;

            const course = await exports.studentController.findCourse(courseId, res);
            if (!course) return;

            if (exports.studentController.isAlreadyRegistered(student, course)) {
                logger.warn(`Student ${studentId} is already registered for course ${courseId}`);
                return res.status(400).json({ message: 'Student is already registered for this course' });
            }

            if (exports.studentController.isCourseFull(course)) {
                logger.warn(`Course ${courseId} is full`);
                return res.status(400).json({ message: 'Course is full' });
            }

            if (exports.studentController.exceedsCreditLimit(student, course)) {
                logger.warn(`Student ${studentId} exceeds the credit limit by registering for course ${courseId}`);
                return res.status(400).json({ message: 'Registration exceeds the credit limit of 20' });
            }

            await exports.studentController.registerStudentToCourse(student, course);

            logger.info(`Registration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            logger.error(`Error during registration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async findStudent(studentId, res) {
        logger.info(`Finding student with ID: ${studentId}`);
        const student = await Student.findOne({ studentId }).populate('registeredCourses');
        if (!student) {
            logger.warn(`Student not found with ID: ${studentId}`);
            res.status(404).json({ message: 'Student not found' });
        }
        return student;
    },

    async findCourse(courseId, res) {
        logger.info(`Finding course with ID: ${courseId}`);
        const course = await Course.findOne({ courseId });
        if (!course) {
            logger.warn(`Course not found with ID: ${courseId}`);
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
        logger.info(`Registering student ${student.studentId} to course ${course.courseId}`);
        student.registeredCourses.push(course._id);
        course.enrolledStudents.push(student._id);
        await student.save();
        await course.save();
        logger.info(`Registration completed for student ${student.studentId} and course ${course.courseId}`);
    },
};

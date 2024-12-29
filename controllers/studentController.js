const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const logger = require('../utils/logger');

exports.studentController = {
    registerForCourse: async (req, res) => {
        try {
            const { studentId, courseId } = req.body;
            logger.info(`Registering student ${studentId} for course ${courseId}`);

            const student = await exports.studentController.findStudentOrFail(studentId, res);
            if (!student) return;

            const course = await exports.studentController.findCourseOrFail(courseId, res);
            if (!course) return;

            if (exports.studentController.checkRegistrationIssues(student, course, res)) return;

            await exports.studentController.registerStudentToCourse(student, course);

            logger.info(`Registration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            logger.error(`Error during registration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

     deregisterFromCourse: async (req, res) => {
        try {
            const { studentId, courseId } = req.body;
            logger.info(`Deregistering student ${studentId} from course ${courseId}`);

            const student = await exports.studentController.findStudentOrFail(studentId, res);
            if (!student) return;

            const course = await exports.studentController.findCourseOrFail(courseId, res);
            if (!course) return;

            
            if (!(exports.studentController.isAlreadyRegistered(student, course))) {
                logger.warn(`Student ${studentId} is not registered for course ${courseId}`);
                return res.status(400).json({ message: 'Student is not registered for this course' });
            }

            
            await exports.studentController.deregisterStudentFromCourse(student, course);

            logger.info(`Deregistration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Deregistration successful', student, course });
        } catch (error) {
            logger.error(`Error during deregistration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async getRegisteredCourses(req, res) {
        try {
            const { id } = req.user; // Extract student ID from the token
            logger.info(`Fetching registered courses for student ID: ${id}`);

            const student = await Student.findOne({ _id: id }).populate({
                path: 'registeredCourses',
                select: 'courseId name instructor creditPoints', // Exclude maxStudents and enrolledStudents
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

    async findStudentOrFail(studentId, res) {
        logger.info(`Finding student with ID: ${studentId}`);
        const student = await Student.findOne({ _id: studentId }).populate('registeredCourses');
        if (!student) {
            logger.warn(`Student not found with ID: ${studentId}`);
            res.status(404).json({ message: 'Student not found' });
            return null;
        }
        return student;
    }
    ,

    async findCourseOrFail(courseId, res) {
        logger.info(`Finding course with ID: ${courseId}`);
        const course = await Course.findOne({ courseId });
        if (!course) {
            logger.warn(`Course not found with ID: ${courseId}`);
            res.status(404).json({ message: 'Course not found' });
            return null;
        }
        return course;
    },

    checkRegistrationIssues(student, course, res) {
        if (this.isAlreadyRegistered(student, course)) {
            logger.warn(`Student ${student.studentId} is already registered for course ${course.courseId}`);
            res.status(400).json({ message: 'Student is already registered for this course' });
            return true;
        }

        if (this.isCourseFull(course)) {
            logger.warn(`Course ${course.courseId} is full`);
            res.status(400).json({ message: 'Course is full' });
            return true;
        }

        if (this.exceedsCreditLimit(student, course)) {
            logger.warn(`Student ${student.studentId} exceeds the credit limit by registering for course ${course.courseId}`);
            res.status(400).json({ message: 'Registration exceeds the credit limit of 20' });
            return true;
        }

        return false;
    },

    async registerStudentToCourse(student, course) {
        logger.info(`Registering student ${student.studentId} to course ${course.courseId}`);
        student.registeredCourses.push(course._id);
        course.enrolledStudents.push(student._id);
        await student.save();
        await course.save();
        logger.info(`Registration completed for student ${student.studentId} and course ${course.courseId}`);
    },

    async deregisterStudentFromCourse(student, course) {
        student.registeredCourses = student.registeredCourses.filter(c => !c._id.equals(course._id));
        course.enrolledStudents = course.enrolledStudents.filter(s => !s._id.equals(student._id));
        await student.save();
        await course.save();
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
};

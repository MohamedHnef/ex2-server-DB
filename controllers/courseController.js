const Course = require('../models/courseModel');
const Student = require('../models/studentModel');
const logger = require('../utils/logger');

exports.courseController = {
    addCourse: async (req, res) => {
        try {
            logger.info('Adding a new course');
            const courseId = await generateNextCourseId();
            const courseData = prepareCourseData(req.body, courseId);
            const savedCourse = await saveCourse(courseData);
            const responseCourse = formatCourseResponse(savedCourse);

            logger.info(`Course added successfully with ID: ${responseCourse.courseId}`);
            res.status(201).json(responseCourse);
        } catch (error) {
            logger.error(`Error adding course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    updateCourse: async (req, res) => {
        try {
            const { id } = req.params;
            logger.info(`Updating course with ID: ${id}`);
            const updatedCourse = await Course.findOneAndUpdate({ courseId: id }, req.body, { new: true });

            if (!updatedCourse) {
                logger.warn(`Course not found with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            logger.info(`Updated course successfully: ${updatedCourse.name}`);
            res.status(200).json(updatedCourse);
        } catch (error) {
            logger.error(`Error updating course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            const { id } = req.params;
            logger.info(`Deleting course with ID: ${id}`);

            const course = await findAndDeleteCourse(id, res);
            if (!course) return;

            await unregisterStudentsFromCourse(course);

            logger.info(`Course deleted successfully: ${course.name}`);
            res.status(200).json({ message: 'Course deleted successfully' });
        } catch (error) {
            logger.error(`Error deleting course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    registerForCourse: async (req, res) => {
        try {
            const { id: courseId } = req.params;
            const studentId = req.user.id;

            logger.info(`Attempting to register student ${studentId} for course ${courseId}`);

            const course = await findCourse(courseId, res);
            if (!course) return;

            const student = await findStudent(studentId, res);
            if (!student) return;

            if (isCourseFull(course, res)) return;
            if (isAlreadyRegistered(student, course)) return res.status(400).json({ message: 'Already registered' });

            if (exceedsCreditLimit(student, course, res)) return;

            await registerStudent(student, course);
            logger.info(`Successfully registered student ${studentId} for course ${courseId}`);
            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            logger.error(`Error during registration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    deregisterFromCourse: async (req, res) => {
        try {
            const { id: courseId } = req.params;
            const studentId = req.user.id;

            logger.info(`Deregistering student ${studentId} from course ${courseId}`);

            const course = await findCourse(courseId, res);
            if (!course) return;

            const student = await findStudent(studentId, res);
            if (!student) return;

            if (!isAlreadyRegistered(student, course)) {
                logger.warn(`Student ${student._id} is not registered for course ${course.courseId}`);
                return res.status(400).json({ message: 'Not registered for this course' });
            }

            await deregisterStudentFromCourse(student, course);

            logger.info(`Successfully deregistered student ${studentId} from course ${courseId}`);
            res.status(200).json({ message: 'Deregistration successful', student, course });
        } catch (error) {
            logger.error(`Error during deregistration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    getAllCoursesAndStudents: async (req, res) => {
        try {
            logger.info('Fetching all courses with registered students');
            const courses = await Course.find()
                .populate('enrolledStudents', 'studentId name email address year')
                .select('courseId name instructor creditPoints maxStudents enrolledStudents');

            const formattedCourses = courses.map(formatCourseResponse);
            res.status(200).json(formattedCourses);
        } catch (error) {
            logger.error(`Error fetching courses: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    getCourseAndStudents: async (req, res) => {
        try {
            const { id: courseId } = req.params;
            logger.info(`Fetching details for course ID: ${courseId}`);

            const course = await findCourse(courseId, res);
            if (!course) return;

            const transformedCourse = formatCourseResponse(course);
            res.status(200).json(transformedCourse);
        } catch (error) {
            logger.error(`Error fetching course details: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

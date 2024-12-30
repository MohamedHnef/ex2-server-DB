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




const isAlreadyRegistered = (student, course) =>
    student.registeredCourses.some((c) => c._id.equals(course._id));

const isCourseFull = (course, res) => {
    if (course.enrolledStudents.length >= course.maxStudents) {
        logger.warn(`Course ${course.courseId} is full`);
        res.status(400).json({ message: 'Course is full' });
        return true;
    }
    return false;
};

const exceedsCreditLimit = (student, course, res) => {
    const totalCredits = student.registeredCourses.reduce((sum, c) => sum + c.creditPoints, 0);
    if (totalCredits + course.creditPoints > 20) {
        logger.warn(`Student ${student._id} exceeds the credit limit with course ${course.courseId}`);
        res.status(400).json({ message: 'Registration exceeds the credit limit of 20 points' });
        return true;
    }
    return false;
};

const findStudent = async (studentId, res) => {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
        logger.warn(`Student not found with ID: ${studentId}`);
        res.status(404).json({ message: 'Student not found' });
        return null;
    }
    return student;
};

const findCourse = async (courseId, res) => {
    const course = await Course.findOne({ courseId });
    if (!course) {
        logger.warn(`Course not found with ID: ${courseId}`);
        res.status(404).json({ message: 'Course not found' });
        return null;
    }
    return course;
};

const generateNextCourseId = async () => {
    const lastCourse = await Course.findOne().sort({ courseId: -1 });
    return lastCourse ? lastCourse.courseId + 1 : 1;
};

const prepareCourseData = (body, courseId) => ({
    ...body,
    courseId,
});

const saveCourse = async (courseData) => {
    const course = new Course(courseData);
    return course.save();
};

const formatCourseResponse = (course) => {
    const courseObject = course.toObject();
    return {
        ...courseObject,
        numberOfStudents: courseObject.enrolledStudents ? courseObject.enrolledStudents.length : 0,
    };
};

const registerStudent = async (student, course) => {
    student.registeredCourses.push(course._id);
    student.pointsTracker += course.creditPoints;
    course.enrolledStudents.push(student._id);
    await Promise.all([student.save(), course.save()]);
    logger.info(`Student ${student._id} successfully registered for course ${course.courseId}`);
};

const deregisterStudentFromCourse = async (student, course) => {
    student.registeredCourses = student.registeredCourses.filter((c) => !c._id.equals(course._id));
    student.pointsTracker -= course.creditPoints;
    course.enrolledStudents = course.enrolledStudents.filter((s) => !s._id.equals(student._id));
    await Promise.all([student.save(), course.save()]);
    logger.info(`Student ${student._id} successfully deregistered from course ${course.courseId}`);
};

const findAndDeleteCourse = async (courseId, res) => {
    const course = await Course.findOneAndDelete({ courseId });
    if (!course) {
        logger.warn(`Course not found with ID: ${courseId}`);
        res.status(404).json({ message: 'Course not found' });
        return null;
    }
    return course;
};

const unregisterStudentsFromCourse = async (course) => {
    logger.info(`Unregistering students from course: ${course.name}`);
    const students = await Student.find({ registeredCourses: course._id });
    for (const student of students) {
        student.registeredCourses = student.registeredCourses.filter((c) => !c.equals(course._id));
        student.pointsTracker -= course.creditPoints;
        await student.save();
        logger.info(`Updated student ${student.name}: removed course ${course.name}`);
    }
};


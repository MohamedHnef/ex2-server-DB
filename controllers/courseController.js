const Course = require('../models/courseModel');
const Student = require('../models/studentModel');
const logger = require('../utils/logger');

exports.courseController = {
    async addCourse(req, res) {
        try {
            logger.info('Adding a new course');
    
            const nextCourseId = await generateNextCourseId(); // Generate the next course ID
            const courseData = prepareCourseData(req.body, nextCourseId); // Prepare the course data
    
            const savedCourse = await saveCourse(courseData); // Save the course to the database
            const responseCourse = formatCourseResponse(savedCourse); // Format the response
    
            logger.info(`Course added successfully with ID: ${responseCourse.courseId}`);
            res.status(201).json(responseCourse); // Send the response
        } catch (error) {
            logger.error(`Error adding course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    } ,
    
    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Updating course with ID: ${id}`);
            const course = await Course.findOneAndUpdate({ courseId: id }, req.body, { new: true });

            if (!course) {
                logger.warn(`Course not found with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            logger.info(`Updated course successfully: ${course.name}`);
            res.status(200).json(course);
        } catch (error) {
            logger.error(`Error updating course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Deleting course with ID: ${id}`);
            const course = await Course.findOneAndDelete({ courseId: id });

            if (!course) {
                logger.warn(`Course not found with ID: ${id}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            await unregisterStudentsFromCourse(course);
            logger.info(`Course deleted successfully: ${course.name}`);
            res.status(200).json({ message: 'Course deleted successfully' });
        } catch (error) {
            logger.error(`Error deleting course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },


    async registerForCourse(req, res) {
        try {
            const { id: courseId } = req.params;
            const studentId = req.user.id;
    
            logger.info(`Attempting to register student ${studentId} for course ${courseId}`);
    
            const course = await findCourse(courseId, res);
            if (!course) return;
    
            const student = await findStudent(studentId, res);
            if (!student) return;
    
            if (isCourseFull(course, res)) return;
            if (isAlreadyRegistered(student, course)) {
                logger.warn(`Student ${student._id} is already registered for course ${course.courseId}`);
                res.status(400).json({ message: 'Student is already registered for this course' });
                return;
            }
    
            if (exceedsCreditLimit(student, course, res)) return;
    
            await registerStudent(student, course);
            logger.info(`Successfully registered student ${studentId} for course ${courseId}`);
            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            logger.error(`Error during course registration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
    ,

    async deregisterFromCourse(req, res) {
        try {
            const { id: courseId } = req.params;
            const studentId = req.user.id; 
            logger.info(`Deregistering student ${studentId} from course ${courseId}`);

            const course = await Course.findOne({ courseId });
            if (!course) {
                logger.warn(`Course not found with ID: ${courseId}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            const student = await Student.findOne({ _id: studentId });
            if (!student) {
                logger.warn(`Student not found with ID: ${studentId}`);
                return res.status(404).json({ message: 'Student not found' });
            }

            if (!isAlreadyRegistered(student, course)) {
                logger.warn(`Student ${studentId} is not registered for course ${courseId}`);
                return res.status(400).json({ message: 'Student is not registered for this course' });
            }

            await deregisterStudentFromCourse(student, course);

            logger.info(`Deregistration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Deregistration successful', student, course });
        } catch (error) {
            logger.error(`Error deregistering from course: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async getAllCoursesAndStudents(req, res) {
        try {
            logger.info('Fetching all courses with their registered students');
            const courses = await Course.find()
                .populate('enrolledStudents', 'studentId name email address year')
                .select('courseId name instructor creditPoints maxStudents enrolledStudents');

            const transformedCourses = courses.map((course) => ({
                ...course.toObject(),
                numberOfStudents: course.enrolledStudents.length,
            }));

            res.status(200).json(transformedCourses);
        } catch (error) {
            logger.error(`Error fetching courses: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async getCourseAndStudents(req, res) {
        try {
            const { id: courseId } = req.params;
            logger.info(`Fetching course details for ID: ${courseId}`);

            const course = await Course.findOne({ courseId })
                .populate('enrolledStudents', 'studentId name email address year')
                .select('courseId name instructor creditPoints maxStudents enrolledStudents');

            if (!course) {
                logger.warn(`Course not found with ID: ${courseId}`);
                return res.status(404).json({ message: 'Course not found' });
            }

            const transformedCourse = {
                ...course.toObject(),
                numberOfStudents: course.enrolledStudents.length,
            };

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

const findStudent = async (studentId, res) => {
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
        logger.warn(`Student not found with ID: ${studentId}`);
        res.status(404).json({ message: 'Student not found' });
        return null;
    }
    return student;
};

const registerStudent = async (student, course) => {
    student.registeredCourses.push(course._id);
    course.enrolledStudents.push(student._id);
    await Promise.all([student.save(), course.save()]);
    logger.info(`Student ${student._id} successfully registered for course ${course.courseId}`);
};

const deregisterStudentFromCourse = async (student, course) => {
    student.registeredCourses = student.registeredCourses.filter((c) => !c._id.equals(course._id));
    course.enrolledStudents = course.enrolledStudents.filter((s) => !s._id.equals(student._id));
    await Promise.all([student.save(), course.save()]);
    logger.info(`Student ${student._id} successfully deregistered from course ${course.courseId}`);
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

const exceedsCreditLimit = (student, course, res) => {
    const totalCredits = student.registeredCourses.reduce((sum, c) => sum + c.creditPoints, 0);
    if (totalCredits + course.creditPoints > 20) {
        logger.warn(`Student ${student._id} exceeds the credit limit with course ${course.courseId}`);
        res.status(400).json({ message: 'Registration exceeds the credit limit of 20 points' });
        return true;
    }
    return false;
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



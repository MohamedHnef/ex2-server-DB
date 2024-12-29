const Faculty = require('../models/facultyModel');
const logger = require('../utils/logger');
const Course = require('../models/courseModel');

exports.facultyController = {
    async getAllCoursesAndStudents(req, res) {
        try {
            logger.info(`Fetching all courses and their registered students`);
    
            const courses = await Course.find()
                .populate('enrolledStudents', 'studentId name email address year')
                .select('courseId name instructor creditPoints maxStudents enrolledStudents');
    
            const transformedCourses = courses.map(course => {
                const courseObject = course.toObject(); 
                courseObject.numberOfStudents = course.enrolledStudents.length; 
                return courseObject;
            });
    
            logger.info(`Successfully fetched ${transformedCourses.length} courses`);
            res.status(200).json(transformedCourses);
        } catch (error) {
            logger.error(`Error fetching courses and students: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    

    async getCourseAndStudents(req, res) {
        try {
            const { courseId } = req.params;
    
            logger.info(`Fetching course details for course ID: ${courseId}`);
    
            const course = await Course.findOne({ courseId })
                .populate('enrolledStudents', 'studentId name email address year')
                .select('courseId name instructor creditPoints maxStudents enrolledStudents');
    
            if (!course) {
                logger.warn(`Course not found with ID: ${courseId}`);
                return res.status(404).json({ message: 'Course not found' });
            }
    
            const courseObject = course.toObject(); 
            courseObject.numberOfStudents = course.enrolledStudents.length; 
    
            logger.info(`Successfully fetched course: ${course.name} with ${courseObject.numberOfStudents} students`);
            res.status(200).json(courseObject);
        } catch (error) {
            logger.error(`Error fetching course details: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

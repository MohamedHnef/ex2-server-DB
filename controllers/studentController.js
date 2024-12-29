exports.studentController = {
    async registerForCourse(req, res) {
        try {
            const { studentId, courseId } = req.body;
            logger.info(`Registering student ${studentId} for course ${courseId}`);

            const student = await this.findStudentOrFail(studentId, res);
            const course = await this.findCourseOrFail(courseId, res);

            if (this.checkRegistrationIssues(student, course, res)) return;

            await this.registerStudentToCourse(student, course);

            logger.info(`Registration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Registration successful', student, course });
        } catch (error) {
            logger.error(`Error during registration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },

    async deregisterFromCourse(req, res) {
        try {
            const { studentId, courseId } = req.body;
            logger.info(`Deregistering student ${studentId} from course ${courseId}`);

            const student = await this.findStudentOrFail(studentId, res);
            const course = await this.findCourseOrFail(courseId, res);

            if (!this.isAlreadyRegistered(student, course)) {
                logger.warn(`Student ${studentId} is not registered for course ${courseId}`);
                return res.status(400).json({ message: 'Student is not registered for this course' });
            }

            await this.deregisterStudentFromCourse(student, course);

            logger.info(`Deregistration successful: Student ${studentId} -> Course ${courseId}`);
            res.status(200).json({ message: 'Deregistration successful', student, course });
        } catch (error) {
            logger.error(`Error during deregistration: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    
    async getRegisteredCourses(req, res) {
        try {
            const { id } = req.user; // Get student ID from token
            logger.info(`Fetching registered courses for student ID: ${id}`);
            const student = await Student.findOne({ studentId: id }).populate('registeredCourses');
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
};

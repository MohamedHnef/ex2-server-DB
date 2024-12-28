const Faculty = require('../models/facultyModel');
const logger = require('../utils/logger');

exports.facultyController = {
    async getAllFaculty(req, res) {
        try {
            logger.info('Fetching all faculty members');
            const faculty = await Faculty.find();
            logger.info('Fetched all faculty members successfully');
            res.status(200).json(faculty);
        } catch (error) {
            logger.error(`Error fetching faculty members: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    async getFaculty(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Fetching faculty member with ID: ${id}`);
            const faculty = await Faculty.findOne({ facultyId: id });
            if (!faculty) {
                logger.warn(`Faculty member not found with ID: ${id}`);
                return res.status(404).json({ message: 'Faculty member not found' });
            }
            logger.info(`Fetched faculty member successfully: ${faculty.name}`);
            res.status(200).json(faculty);
        } catch (error) {
            logger.error(`Error fetching faculty member: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
    async addFaculty(req, res) {
        try {
            logger.info('Adding a new faculty member');
            const faculty = new Faculty(req.body);
            await faculty.save();
            logger.info(`Added faculty member successfully: ${faculty.name}`);
            res.status(201).json(faculty);
        } catch (error) {
            logger.error(`Error adding faculty member: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },
    async updateFaculty(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Updating faculty member with ID: ${id}`);
            const faculty = await Faculty.findOneAndUpdate({ facultyId: id }, req.body, { new: true });
            if (!faculty) {
                logger.warn(`Faculty member not found for update with ID: ${id}`);
                return res.status(404).json({ message: 'Faculty member not found' });
            }
            logger.info(`Updated faculty member successfully: ${faculty.name}`);
            res.status(200).json(faculty);
        } catch (error) {
            logger.error(`Error updating faculty member: ${error.message}`);
            res.status(400).json({ error: error.message });
        }
    },
    async deleteFaculty(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Deleting faculty member with ID: ${id}`);
            const faculty = await Faculty.findOneAndDelete({ facultyId: id });
            if (!faculty) {
                logger.warn(`Faculty member not found for deletion with ID: ${id}`);
                return res.status(404).json({ message: 'Faculty member not found' });
            }
            logger.info(`Deleted faculty member successfully: ${faculty.name}`);
            res.status(200).json({ message: 'Faculty member deleted successfully' });
        } catch (error) {
            logger.error(`Error deleting faculty member: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    },
};

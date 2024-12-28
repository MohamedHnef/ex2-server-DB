const Faculty = require('../models/facultyModel');

exports.facultyController = {
    async getAllFaculty(req, res) {
        try {
            const faculty = await Faculty.find();
            res.status(200).json(faculty);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getFaculty(req, res) {
        try {
            const faculty = await Faculty.findOne({ facultyId: req.params.id });
            if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
            res.status(200).json(faculty);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addFaculty(req, res) {
        try {
            const faculty = new Faculty(req.body);
            await faculty.save();
            res.status(201).json(faculty);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updateFaculty(req, res) {
        try {
            const faculty = await Faculty.findOneAndUpdate({ facultyId: req.params.id }, req.body, { new: true });
            if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
            res.status(200).json(faculty);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deleteFaculty(req, res) {
        try {
            const faculty = await Faculty.findOneAndDelete({ facultyId: req.params.id });
            if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
            res.status(200).json({ message: 'Faculty member deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

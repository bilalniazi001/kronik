const HolidayModel = require('../models/HolidayModel');

class HolidayController {
    static async getAll(req, res, next) {
        try {
            const holidays = await HolidayModel.getAll();
            res.json({ success: true, data: holidays });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, holiday_date } = req.body;

            if (!title || !holiday_date) {
                return res.status(400).json({ success: false, message: 'Title and date are required' });
            }

            const existing = await HolidayModel.getByDate(holiday_date);
            if (existing) {
                return res.status(400).json({ success: false, message: 'A holiday already exists on this date' });
            }

            const id = await HolidayModel.create(title, holiday_date, req.userId);
            res.status(201).json({ success: true, message: 'Holiday created successfully', data: { id } });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const success = await HolidayModel.delete(id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Holiday not found' });
            }
            res.json({ success: true, message: 'Holiday deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HolidayController;

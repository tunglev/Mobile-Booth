const SQLiteFeedbackModel = require('../model/SQLiteFeedbackModel');

// Get all feedback entries
async function getAllFeedback(req, res) {
    await SQLiteFeedbackModel.init();
    try {
        console.log("Retrieving all feedback from SQLite");
        const feedbacks = await SQLiteFeedbackModel.read();
        res.json(feedbacks);
    } catch (error) {
        console.error('Error reading feedback from SQLite:', error);
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
}

// Create new feedback entry
async function createFeedback(req, res) {
    await SQLiteFeedbackModel.init();
    try {
        const { name, email, feedback } = req.body;

        if (!name || !email || !feedback) {
            return res.status(400).json({ error: 'Name, email, and feedback are required' });
        }

        const newFeedback = {
            name,
            email,
            feedback,
            timestamp: new Date().toISOString(),
        };

        const savedFeedback = await SQLiteFeedbackModel.create(newFeedback);
        res.status(201).json(savedFeedback);
    } catch (error) {
        console.error('Error creating feedback in SQLite:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
}

module.exports = {
    getAllFeedback,
    createFeedback
};


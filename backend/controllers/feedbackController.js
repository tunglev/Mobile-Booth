const fs = require('fs').promises;
const path = require('path');

const dataFile = path.join(__dirname, '../data/feedbacks.json');

// Ensure data directory and file exist
async function ensureDataFile() {
    try {
        await fs.mkdir(path.dirname(dataFile), { recursive: true });
        try {
            await fs.access(dataFile);
        } catch {
            await fs.writeFile(dataFile, '[]');
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
        throw error;
    }
}

// Initialize data file
ensureDataFile();

// Get all feedback entries
async function getAllFeedback(req, res) {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const feedbacks = JSON.parse(data);
        res.json(feedbacks);
    } catch (error) {
        console.error('Error reading feedback:', error);
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
}

// Create new feedback entry
async function createFeedback(req, res) {
    try {
        const { name, email, feedback } = req.body;

        // Validate required fields
        if (!name || !email || !feedback) {
            return res.status(400).json({ error: 'Name, email, and feedback are required' });
        }

        // Read existing feedback
        const data = await fs.readFile(dataFile, 'utf8');
        const feedbacks = JSON.parse(data);

        // Create new feedback entry
        const newFeedback = {
            id: Date.now(), // Simple unique ID
            name,
            email,
            feedback,
            timestamp: new Date().toISOString()
        };

        // Add to array and save
        feedbacks.push(newFeedback);
        await fs.writeFile(dataFile, JSON.stringify(feedbacks, null, 2));

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
}

module.exports = {
    getAllFeedback,
    createFeedback
};

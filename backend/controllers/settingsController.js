const fs = require('fs');
const path = require('path');

const settingsFilePath = path.join(__dirname, '../mockDB/settings.json');

// Helper function to read settings.json
const readSettings = () => {
    try {
        if (!fs.existsSync(settingsFilePath)) {
            writeSettings({ username: '', theme: 'light', language: 'en' });
        }
        const data = fs.readFileSync(settingsFilePath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading settings.json:', error);
        return {};
    }
};

// Helper function to write to settings.json
const writeSettings = (settings) => {
    try {
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to settings.json:', error);
    }
};

// Get all settings
exports.getSettings = (req, res) => {
    const settings = readSettings();
    res.status(200).json(settings);
};

// Create initial settings
exports.createSettings = (req, res) => {
    const { username, theme = 'light', language = 'en' } = req.body;
    const settings = { username, theme, language };

    writeSettings(settings);
    res.status(201).json({
        message: 'Settings created successfully',
        settings,
    });
};

exports.updateAllSettings = (req, res) => {
    const { username, theme, language } = req.body;

    // Validate input
    if (!username || !theme || !language) {
        return res.status(400).json({ message: 'All fields (username, theme, language) are required' });
    }

    const settings = { username, theme, language };

    try {
        writeSettings(settings); // Save settings to file
        res.status(200).json({
            message: 'Settings updated successfully',
            settings,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};
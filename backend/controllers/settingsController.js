const fs = require('fs');
const path = require('path');

const settingsFilePath = path.join(__dirname, '../mockDB/settings.json');

// Helper function to read settings.json
const readSettings = () => {
    try {
        const data = fs.readFileSync(settingsFilePath, 'utf8');
        return JSON.parse(data);
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

// Update theme
exports.updateTheme = (req, res) => {
    const { theme } = req.body;
    if (!theme) {
        return res.status(400).json({ message: 'Theme is required' });
    }

    const settings = readSettings();
    settings.theme = theme;

    writeSettings(settings);
    res.status(200).json({
        message: 'Theme updated successfully',
        settings,
    });
};

// Update username
exports.updateUsername = (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const settings = readSettings();
    settings.username = username;

    writeSettings(settings);
    res.status(200).json({
        message: 'Username updated successfully',
        settings,
    });
};

// Update language
exports.updateLanguage = (req, res) => {
    const { language } = req.body;
    if (!language) {
        return res.status(400).json({ message: 'Language is required' });
    }

    const settings = readSettings();
    settings.language = language;

    writeSettings(settings);
    res.status(200).json({
        message: 'Language updated successfully',
        settings,
    });
};
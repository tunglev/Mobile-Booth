const SQLiteSettingsModel = require('../model/SQLiteSettingsModel');

// Initialize the SQLiteSettingsModel
SQLiteSettingsModel.init();

// Get all settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await SQLiteSettingsModel.read();
        res.status(200).json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

// Create initial settings
exports.createSettings = async (req, res) => {
    const { username, theme = 'light', language = 'en' } = req.body;
    const settings = { username, theme, language };

    try {
        await SQLiteSettingsModel.update(settings);
        res.status(201).json({
            message: 'Settings created successfully',
            settings,
        });
    } catch (error) {
        console.error('Error creating settings:', error);
        res.status(500).json({ message: 'Failed to create settings' });
    }
};

// Update all settings
exports.updateAllSettings = async (req, res) => {
    const { username, theme, language } = req.body;

    // Validate input
    if (!username || !theme || !language) {
        return res.status(400).json({ message: 'All fields (username, theme, language) are required' });
    }

    const settings = { username, theme, language };

    try {
        const updatedSettings = await SQLiteSettingsModel.update(settings);
        res.status(200).json({
            message: 'Settings updated successfully',
            settings: updatedSettings,
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};
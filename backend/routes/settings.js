const express = require('express');
const router = express.Router();

const {
    getSettings,
    createSettings,
    updateTheme,
    updateUsername,
    updateLanguage
} = require('../controllers/settingsController');

// Route to get all settings
router.get('/', getSettings);

// Route to initialize settings (POST)
router.post('/', createSettings);

// Route to update light/dark mode
router.put('/theme', updateTheme);

// Route to update username
router.put('/username', updateUsername);

// Route to update language
router.put('/language', updateLanguage);

module.exports = router;
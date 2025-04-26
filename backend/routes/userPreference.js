const express = require('express');
const router = express.Router();
const userPreferenceController = require('../controllers/userPreferenceController');

// GET current preferences
router.get('/', userPreferenceController.getPreferences);

// PUT (update) preferences
router.put('/', userPreferenceController.updatePreferences);

module.exports = router;

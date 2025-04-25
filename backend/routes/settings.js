const express = require('express');
const router = express.Router();

const {
    getSettings,
    createSettings,
    updateAllSettings, 
} = require('../controllers/settingsController');

router.get('/', getSettings);
router.post('/', createSettings);
router.put('/', updateAllSettings);

module.exports = router;
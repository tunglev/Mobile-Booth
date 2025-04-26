const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Get all feedback entries
router.get('/', feedbackController.getAllFeedback);

// Submit new feedback
router.post('/', feedbackController.createFeedback);

module.exports = router;

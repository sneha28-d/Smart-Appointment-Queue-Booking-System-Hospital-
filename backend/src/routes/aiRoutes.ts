const express = require('express');
const { handleAIChat } = require('../controllers/aiController');
const { Protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected chat route for patients asking questions to Gemini
router.post('/chat', Protect, handleAIChat);

module.exports = router;

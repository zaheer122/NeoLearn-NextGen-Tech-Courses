const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/send', isAuthenticated, sendMessage);

module.exports = router; 
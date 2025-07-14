import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

// Send a message
router.post('/send', isAuthenticated, sendMessage);

// Get messages
router.get('/messages', isAuthenticated, getMessages);

export default router; 
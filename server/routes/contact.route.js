import express from "express";
import { submitContactForm, getContactMessages, updateMessageStatus } from "../controllers/contact.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Public route for submitting contact form
router.post("/submit", submitContactForm);

// Protected routes for admin
router.get("/messages", isAuthenticated, getContactMessages);
router.patch("/messages/:id", isAuthenticated, updateMessageStatus);

export default router; 
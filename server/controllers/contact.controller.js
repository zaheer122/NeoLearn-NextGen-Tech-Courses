import Contact from "../models/contact.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate message length
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters long"
            });
        }

        // Create new contact entry
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        try {
            // Send confirmation email to user
            await sendEmail({
                email: email,
                subject: "Thank you for contacting NeoLearn",
                message: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you soon.\n\nBest regards,\nNeoLearn Team`
            });

            // Send notification email to admin
            await sendEmail({
                email: process.env.ADMIN_EMAIL,
                subject: "New Contact Form Submission",
                message: `New contact form submission received:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Continue with the response even if email fails
        }

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: contact
        });
    } catch (error) {
        console.error("Contact form submission error:", error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to submit contact form. Please try again later."
        });
    }
};

export const getContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find()
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact messages"
        });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['pending', 'read', 'replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const message = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error("Error updating message status:", error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update message status"
        });
    }
}; 
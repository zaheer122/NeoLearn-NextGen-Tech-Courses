import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Please enter a valid email address"]
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        minlength: [10, "Message must be at least 10 characters long"]
    },
    status: {
        type: String,
        enum: ["pending", "read", "replied"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact; 
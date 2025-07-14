import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isMeetLink: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const Message = mongoose.model('Message', messageSchema); 
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String
    }],
    correctOption: {
        type: Number,
        required: true
    }
});

const lectureSchema = new mongoose.Schema({
    lectureTitle:{
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ""
    },
    videoUrl:{
        type: String
    },
    publicId:{
        type: String
    },
    isPreview:{
        type: Boolean,
        default: false
    },
    quiz: [quizSchema]
}, {timestamps: true});

export const Lecture = mongoose.model("Lecture", lectureSchema)
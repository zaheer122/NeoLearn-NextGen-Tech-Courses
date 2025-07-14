import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
           
            serverSelectionTimeoutMS: 50000, // Timeout after 5 seconds if MongoDB is unreachable
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error occurred while connecting to MongoDB:", error.message);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
};

export default connectDB;

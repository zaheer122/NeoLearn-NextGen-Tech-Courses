import express from "express"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import courseRoute from "./routes/course.route.js"
import chatRoute from "./routes/chatRoutes.js"
import contactRoute from "./routes/contact.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import morgan from "morgan"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000 

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Performance middleware
app.use(compression())

// Logging
app.use(morgan('dev'))

// Default middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// APIs
app.use("/api/v1/user", userRoute)
app.use("/api/v1/course", courseRoute)
app.use("/api/v1/chat", chatRoute)
app.use("/api/v1/contact", contactRoute)

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

app.listen(PORT, () => {
    connectDB()
    console.log(`Server listening at port ${PORT}`)
})
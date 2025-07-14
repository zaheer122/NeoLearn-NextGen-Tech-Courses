import jwt from "jsonwebtoken";

export const isAuthenticated = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated. Please login."
            });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            
            if (!decoded || !decoded.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Please login again."
                });
            }
            
            // Set the userId in the request object
            req.id = decoded.userId;
            next();
        } catch (tokenError) {
            // Handle specific JWT errors
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Session expired. Please login again."
                });
            }
            
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please login again."
            });
        }
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during authentication."
        });
    }
}
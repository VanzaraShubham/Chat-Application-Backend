// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// // middleware to protect routes
// export const protectedRoute = async (req, res, next) => {
//     try {
//         const token = req.headers.token;

//         const decoded = jwt.verify(token, process.env.JWT_SECRET)

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user) return res.json({success: false, message: "User not found"});
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(error.message);
//         res.json({success: false, message: error.message})
//     } 
// }

import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectedRoute = async (req, res, next) => {
  try {
    // Try getting token from 'Authorization' or 'token' header
    let token = req.headers.authorization || req.headers.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "JWT must be provided" });
    }

    // If the header uses "Bearer <token>", extract actual token
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    // Handle specific JWT errors clearly
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res.status(500).json({ success: false, message: "Authentication failed" });
    }
  }
};

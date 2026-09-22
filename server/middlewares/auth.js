const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
// const dotenv = require("dotenv");
// dotenv.config();

// auth
// Session auth: the JWT travels only as an httpOnly cookie.
exports.auth = async (req, res, next) => {
    try {
        // Cookie-only. The Authorization header and body token were accepted
        // while the client still held a bearer token; now that it does not, a
        // second accepted credential path would only widen the surface the
        // httpOnly cookie exists to close. Re-add the header read here if a
        // non-browser client ever needs it.
        const token = req.cookies.token;

        // if token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        // verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            // verification issue
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
}

// isStudent
// The three role guards answer 403, not 401: reaching them means auth accepted
// the session and only the role is wrong. A 401 signed the user out instead.
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Student") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for Student only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);
        console.log(userDetails.accountType);

        if (userDetails.accountType !== "Instructor") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for Instructor only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "This is protected route for Admin only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
}
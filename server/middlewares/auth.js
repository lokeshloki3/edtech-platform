const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
// const dotenv = require("dotenv");
// dotenv.config();

// auth
// authentication bearer > cookies > body - safety of token
exports.auth = async (req, res, next) => {
    try {
        // extract token
        // The httpOnly cookie is the primary credential. The Authorization
        // header is still accepted for the not-yet-migrated client call sites.
        // `req.header(...)` is undefined when the header is absent, so it has to
        // be guarded — calling .replace() on it threw and surfaced as a 500
        // "something went wrong" instead of a plain 401.
        const authHeader = req.header("Authorization");
        const token = req.cookies.token
            || req.body.token
            || (authHeader ? authHeader.replace("Bearer ", "") : null);

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
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Student") {
            return res.status(401).json({
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
            return res.status(401).json({
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
            return res.status(401).json({
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
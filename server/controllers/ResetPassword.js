const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
    validateRequired,
    validateEmail,
    validatePassword,
    firstError,
    normalizeEmail,
} = require("../utils/validateAuth");
// const dotenv = require("dotenv");
// dotenv.config();

require("dotenv").config();

// resetPasswordToken function - sends email
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const emailError = validateEmail(req.body.email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        const email = normalizeEmail(req.body.email);
        // check user for this email
        const user = await User.findOne({ email: email });
        // email validation
        if (!user) {
            return res.status(400).json({
                success: false,
                message: `Your email: ${email} is not registered with us`,
            });
        }
        // generate token
        const token = crypto.randomBytes(20).toString("hex");
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 min
            },
            {
                new: true, // give latest one
            }
        );
        console.log("Details", updatedDetails);
        // create url
        // const url = `http://localhost:5173/update-password/${token}`
        const url = `${process.env.FRONTEND_URL_UPDATE_PASSWORD}/update-password/${token}`;
        // send mail containing the url
        await mailSender(
            email,
            "Password Reset Link for your StudySphere account",
            `Password Reset Link: ${url}`
        );
        // return response
        return res.status(200).json({
            success: true,
            message: "Email sent successfully, please check email and change pwd",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending reset pwd mail",
        });
    }
}


// resetPassword

exports.resetPassword = async (req, res) => {
    try {
        // data fetch - token from params sent in req by frontend
        const { password, confirmPassword, token } = req.body;
        // The presence checks matter as much as the length one: with both
        // fields missing the match check passed and bcrypt.hash threw a 500.
        const validationError = firstError([
            validatePassword(password),
            validateRequired(confirmPassword, "Confirm password"),
            validateRequired(token, "Reset token"),
        ]);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }
        // get user details from db using token
        const userDetails = await User.findOne({ token: token });
        // if no entry - invalid token
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid",
            });
        }
        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Token is expired, please regenerate your token",
            });
        }
        // hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        // password update
        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true },
        );
        // return response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting your password",
        });
    }
}
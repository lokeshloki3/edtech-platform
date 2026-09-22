const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { hashToken } = require("../utils/hashToken");
const {
    validateRequired,
    validateEmail,
    validatePassword,
    firstError,
    normalizeEmail,
} = require("../utils/validateAuth");

require("dotenv").config();

const RESET_TOKEN_TTL_MS = 5 * 60 * 1000;

const RESET_REQUESTED_MESSAGE =
    "If an account exists for that email, a password reset link has been sent to it.";

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
        const user = await User.findOne({ email: email });

        // Answer as if the account existed, and send nothing.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: RESET_REQUESTED_MESSAGE,
            });
        }

        // The raw token goes in the email; only its hash is stored.
        const token = crypto.randomBytes(20).toString("hex");

        await User.findOneAndUpdate(
            { email: email },
            {
                resetPasswordTokenHash: hashToken(token),
                resetPasswordExpires: Date.now() + RESET_TOKEN_TTL_MS,
            }
        );

        const url = `${process.env.FRONTEND_URL_UPDATE_PASSWORD}/update-password/${token}`;

        // Allowed to throw: this email is the feature, not a notification.
        await mailSender(
            email,
            "Password Reset Link for your StudySphere account",
            `Password Reset Link: ${url}`
        );

        return res.status(200).json({
            success: true,
            message: RESET_REQUESTED_MESSAGE,
        });
    } catch (error) {
        console.error("resetPasswordToken failed:", error);
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

        const tokenHash = hashToken(token);
        const userDetails = await User.findOne({ resetPasswordTokenHash: tokenHash });

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid",
            });
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Token is expired, please regenerate your token",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // $unset matters: the token used to survive the reset and stay usable.
        await User.updateOne(
            { _id: userDetails._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetPasswordTokenHash: "", resetPasswordExpires: "" },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("resetPassword failed:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting your password",
        });
    }
}

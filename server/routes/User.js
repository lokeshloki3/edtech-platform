// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  logout,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")
const { loginLimiter, emailDispatchLimiter } = require("../middlewares/rateLimit")

// Routes for Login, Signup, and Authentication

// Authentication routes

// Route for user login. Throttled; only failed attempts count.
router.post("/login", loginLimiter, login)

// Route for clearing the session cookie
router.post("/logout", logout)

// Route for user signup
router.post("/signup", signUp)

// Route for sending OTP to the user's email. Throttled per IP and per target.
router.post("/sendotp", emailDispatchLimiter, sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// Reset Password
// Route for generating a reset password token. Same limiter as /sendotp.
router.post("/reset-password-token", emailDispatchLimiter, resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router
const mongoose = require("mongoose");

const OTP_TTL_SECONDS = 5 * 60;
const MAX_OTP_ATTEMPTS = 5;

// The code is stored as a hash and capped at MAX_OTP_ATTEMPTS guesses. The
// verification email is sent by the controller, not by a pre-save hook.
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        // `Date.now`, not `Date.now()`: called, it evaluates once at module load
        // and every OTP shares that timestamp, so all of them expire at once.
        default: Date.now,
        expires: OTP_TTL_SECONDS,
    },
});

module.exports = mongoose.model("OTP", OTPSchema);
module.exports.OTP_TTL_SECONDS = OTP_TTL_SECONDS;
module.exports.MAX_OTP_ATTEMPTS = MAX_OTP_ATTEMPTS;

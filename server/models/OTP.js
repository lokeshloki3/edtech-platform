const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60, // 5 min
    },
});

// a function -> to send emails pre save middleware hook to be sent before DB entry of actual Data
async function sendVerificationEmail(email, otp) {
    // Create a transporter to send emails

    // Define the email options

    // Send the email
    try {
        const mailResponse = await mailSender(
            email,
            "Verification OTP from edTech platform - StudySphere",
            emailTemplate(otp)
        );
        console.log("Email sent successfully: ", mailResponse.response);
    } catch (error) {
        console.log("Error occured while sending mails: ", error);
        throw error;
    }
}

// OTP pre save middleware added before OTP exports as pre hook
// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next(); // Move to next middleware
})

module.exports = mongoose.model("OTP", OTPSchema);

// const OTP = mongoose.model("OTP", OTPSchema);

// module.exports = OTP;
const nodemailer = require('nodemailer');

// Throws on failure. It used to swallow everything, so no caller could tell a
// delivered email from a dropped one.
const mailSender = async (email, title, body) => {
    const transporter = nodemailer.createTransport({
        // service: "gmail",
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return transporter.sendMail({
        from: `"Studysphere" <${process.env.EMAIL_USER}>`,
        to: `${email}`,
        subject: `${title}`,
        html: `${body}`,
    });
};

// For mail that must never fail the operation that triggered it.
const trySendMail = async (email, title, body, context = "") => {
    try {
        await mailSender(email, title, body);
        return true;
    } catch (error) {
        console.error(`Mail delivery failed${context ? ` (${context})` : ""}:`, error.message);
        return false;
    }
};

module.exports = mailSender;
module.exports.trySendMail = trySendMail;

const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            // service: "gmail",
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from: `"Studysphere" <${process.env.EMAIL_USER}>`, // sender address
            to: `${email}`, // list of receivers
            subject: `${title}`,
            html: `${body}`,
        })
        console.log(info);
        return info;
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;
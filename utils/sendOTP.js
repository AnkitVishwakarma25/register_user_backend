
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {

    const Transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    await Transporter.sendMail({

        from: "Ankit",
        to,
        subject,
        text,
    });






};
module.exports = sendEmail;
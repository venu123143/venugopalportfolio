const nodeMailer = require('nodemailer')
const sendEmail = (options) => {
    const transporter = nodeMailer.createTransport({
        // host: process.env.SMPT_HOST,
        // port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.emailid,
        subject: options.subject,
        text: options.message
    };
    transporter.sendMail(mailOptions)
        .then(() => console.log("message sent through email"))
        .catch((err) => console.log(err, " this is the error"))
}
module.exports = sendEmail;
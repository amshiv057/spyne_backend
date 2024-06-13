const nodeMailer = require("nodemailer");
require("../../config/config");
// console.log(global.gConfig);
const user = global.gConfig.nodemailer.USER;
const password = global.gConfig.nodemailer.PASS
var transporter = nodeMailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: password
    }
});
module.exports = {
    sendMail: async (to, data) => {
        await transporter.sendMail({
            from: 'tiwarishiv7169@gmail.com',
            to: to,
            subject: 'Otp Verification',
            text: `Welcome to SPYNE your otp is ${data}`
        });
    }
}


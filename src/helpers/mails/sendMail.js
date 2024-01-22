const nodemailer = require("nodemailer");
const logger = require("../../config/logger");
const { SMTP_USER, SMTP_PASSWORD } = process.env;

const sendMail = (userEmail, subject, content) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true in prod
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOption = {
      from: SMTP_USER,
      to: userEmail,
      subject: subject,
      html: content,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        logger.error(`Mail send error to: ${userEmail}`)
        console.log("Mail send eror: ", error);
      } else {
        logger.info(`Mail sent to ${userEmail}:${info.response}`);
      }
    });
  } catch (error) {
    // console.log("Mail send eror: ", error);
  }
};

module.exports = sendMail;

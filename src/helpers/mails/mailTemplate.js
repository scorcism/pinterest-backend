const { each } = require("lodash");
const sendMail = require("./sendMail");

const verificationMail = async (email, link) => {
  let subject = `Account Verification - scor32k`;
  let content = `
  <h2>Hello ${email}</h2>
    <h4>please verify your account</h4>
    <a href="${link}">Click on the click to verify your account</a>
    <p>Thank you</p>
  `;

  sendMail(email, subject, content);
};

const resetPasswordMail = async (email, link) => {
  let subject = "Reset Password - scor32k";
  let content = `
  <h2>Hello ${email}</h2>
    <h4>Here is the reset <a href="${link}">link</a></h4>
    <p>Thank you</p>
  `;

  sendMail(email, subject, content);
};

module.exports = {
  verificationMail,
  resetPasswordMail
};
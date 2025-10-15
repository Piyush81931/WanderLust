
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS 
      }
    });

    await transporter.sendMail({
      from: `"WanderLust" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

module.exports = sendEmail;

const nodemailer = require('nodemailer');

// Configure ethereal email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text, attachments = []) => {
  // Prevent terminal errors by checking for placeholder credentials
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('replace_with')) {
    console.log(`[Mailer Skipped]: Email to ${to} was not sent because SMTP credentials are not configured.`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Job Board Platform" <no-reply@jobboard.com>',
      to,
      subject,
      text,
      attachments,
    });
    console.log(`Message sent: ${info.messageId}`);
    // Ethereal specific, will not work for real SMTP providers
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
       console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    // Only log a clean message instead of a giant stack trace
    console.error(`[Mailer Error]: Failed to send email to ${to}. Reason: ${error.message}`);
  }
};

module.exports = {
  sendEmail
};

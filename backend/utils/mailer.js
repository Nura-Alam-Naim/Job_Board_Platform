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
    console.error('Error sending email: ', error);
  }
};

const sendVerificationEmail = async (to, token, role) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}&role=${role}`;

    const info = await transporter.sendMail({
      from: '"Job Board System" <noreply@jobboard.com>',
      to,
      subject: 'Verify your email address',
      html: `
        <h2>Welcome to JobBoard!</h2>
        <p>Please verify your email address to activate your account by clicking the link below:</p>
        <a href="${verifyUrl}">Verify Email Address</a>
        <br/><br/>
        <p>If you did not create this account, please ignore this email.</p>
      `
    });

    console.log('Verification email sent: %s', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending verification email: ', error);
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail
};

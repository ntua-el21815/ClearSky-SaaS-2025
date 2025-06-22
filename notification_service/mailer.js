const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'clearskyntua@gmail.com',
    pass: 'mqtp tarq kply eaxl' // App Password
  }
});

async function sendEmail(to, subject, htmlContent) {  // άλλαξε εδώ
  const mailOptions = {
    from: '"ClearSky" <clearskyntua@gmail.com>',
    to,
    subject,
    html: htmlContent  // Χρησιμοποιούμε το htmlContent σωστά
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

module.exports = sendEmail;

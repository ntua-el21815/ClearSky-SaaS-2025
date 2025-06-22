const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'apost5110@gmail.com',
    pass: 'tqjf uamh lgew bluo' // App Password
  }
});

async function sendEmail(to, subject, htmlContent) {  // άλλαξε εδώ
  const mailOptions = {
    from: '"ClearSky" <apost5110@gmail.com>',
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

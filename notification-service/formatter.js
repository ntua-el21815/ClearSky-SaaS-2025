function formatNotification(event) {
  let title = '';
  let message = '';

  switch (event.type) {
    case 'GRADE_POSTED':
      title = '📘 New Grade Posted';
      message = 'Your new grade has been posted to the ClearSky platform. Log in to view your performance.';
      break;

    case 'REVIEW_REQUEST_CREATED':
      title = '📝 Review Request Submitted';
      message = 'Your request for review has been submitted. You will be notified once it has been processed.';
      break;

    case 'REVIEW_REPLY':
      title = '💬 Reply to Your Review';
      message = 'A response has been posted to your review. Visit the platform to read the reply.';
      break;

    default:
      title = '🔔 New Notification';
      message = 'You have received a new message from the ClearSky system.';
  }

  return `
    <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #0057A0;">${title}</h2>
        <p style="font-size: 16px; color: #333;">${message}</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="https://clearsky.example.com" style="background: #0057A0; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            Open ClearSky Platform
          </a>
        </div>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 13px; color: #999; text-align: center;">
          This is an automated message from the ClearSky system. Do not reply to this email.
        </p>
      </div>
    </div>
  `;
}

module.exports = formatNotification;

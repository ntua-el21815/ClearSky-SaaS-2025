const amqp = require('amqplib');
const formatNotification = require('./formatter');
const sendEmail = require('./mailer');
const connectDB = require('./db');
const UserEmail = require('./models/UserEmail'); // ✅ You'll need this model

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const NOTIFICATION_QUEUE = 'notifications';
const USER_CREATED_QUEUE = 'user_created';

async function startConsumer() {
  await connectDB(); // ✅ Connect to MongoDB

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
  await channel.assertQueue(USER_CREATED_QUEUE, { durable: true });

  console.log(`🟢 Listening on queues: "${NOTIFICATION_QUEUE}", "${USER_CREATED_QUEUE}"`);

  // 🔔 Notification handler
  channel.consume(NOTIFICATION_QUEUE, async msg => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());

      let emails = [];

      if (event.type === 'GRADE_POSTED') {
        emails = event.emails || [];
      } else if (event.studentId) {
        const entry = await UserEmail.findOne({ studentId: event.studentId });
        if (entry) emails.push(entry.email);
      }

      const html = formatNotification(event);
      for (const email of emails) {
        await sendEmail(email, '📢 ClearSky Notification', html);
      }

      channel.ack(msg);
    } catch (err) {
      console.error('❌ Notification processing failed:', err);
      channel.nack(msg, false, false);
    }
  });

  // 👤 User Created handler
  channel.consume(USER_CREATED_QUEUE, async msg => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      const { userId, email } = data;

      if (!userId || !email) {
        console.warn('⚠️ Invalid user data received');
        channel.ack(msg);
        return;
      }

      await UserEmail.updateOne(
        { studentId: userId },
        { studentId: userId, email },
        { upsert: true }
      );

      console.log(`✅ Stored user: ${userId} → ${email}`);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Failed to store user:', err);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer();

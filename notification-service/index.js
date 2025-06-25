const amqp = require('amqplib');
const formatNotification = require('./formatter');
const sendEmail = require('./mailer');
const connectDB = require('./db');
const UserEmail = require('./models/UserEmail'); // ✅ You'll need this model

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const NOTIFICATION_QUEUE = 'notifications';
const EXCHANGE_NAME = 'user.signup';
const FANOUT_QUEUE = 'notification.fanout.queue';

async function startConsumer() {
  await connectDB(); // ✅ Connect to MongoDB

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
  const q = await channel.assertQueue(FANOUT_QUEUE, { durable: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

  console.log(`🟢 Listening on queues: "${NOTIFICATION_QUEUE}", "${FANOUT_QUEUE}"`);

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
  channel.consume(q.queue, async msg => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      const { userId, email } = data;

      if (!userId || !email) {
        console.warn('⚠️ Invalid user data received (fanout)');
        channel.ack(msg);
        return;
      }

      await UserEmail.updateOne(
        { studentId: userId },
        { studentId: userId, email },
        { upsert: true }
      );

      console.log(`✅ Stored user (via fanout): ${userId} → ${email}`);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Fanout handler error:', err);
      channel.nack(msg, false, false);
    }
  });

}

startConsumer();

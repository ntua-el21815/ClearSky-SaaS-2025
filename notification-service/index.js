const amqp = require('amqplib');
const formatNotification = require('./formatter');
const sendEmail = require('./mailer');
const connectDB = require('./db');
const UserEmail = require('./models/UserEmail');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const NOTIFICATION_QUEUE = 'notifications';
const REVIEW_NOTIFICATION_QUEUE = 'review_notifications';
const EXCHANGE_NAME = 'user.signup';
const FANOUT_QUEUE = 'notification.fanout.queue';

const ALLOWED_EMAILS = new Set([
  'el20054@mail.ntua.gr',
  'el20110@mail.ntua.gr',
  'el21815@mail.ntua.gr',
  'liaskentzou@gmail.com',
  'agerardou@gmail.com',
  'el21044@mail.ntua.gr',
  'harris.sfiris@gmail.com'
]);

async function startConsumer() {
  await connectDB();

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
  await channel.assertQueue(REVIEW_NOTIFICATION_QUEUE, { durable: true });
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });

  const q = await channel.assertQueue(FANOUT_QUEUE, { durable: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

  console.log(`🟢 Listening on queues: "${NOTIFICATION_QUEUE}", "${REVIEW_NOTIFICATION_QUEUE}", "${FANOUT_QUEUE}"`);

  // 🔔 Notification queue handler (grades etc.)
  channel.consume(NOTIFICATION_QUEUE, async msg => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());

      let emails = [];

      if (event.type === 'GRADES_POSTED') {
        emails = event.emails || [];
      } else if (event.studentId) {
        const entry = await UserEmail.findOne({ studentId: event.studentId });
        if (entry) emails.push(entry.email);
      }

      const html = formatNotification(event);
      for (const email of emails) {
        if (!ALLOWED_EMAILS.has(email)) {
          console.warn(`❌ Blocked email to unauthorized address: ${email}`);
          continue;
        }
        await sendEmail(email, '📢 ClearSky Notification', html);
      }

      channel.ack(msg);
    } catch (err) {
      console.error('❌ Notification processing failed:', err);
      channel.nack(msg, false, false);
    }
  });

  // 🔔 Review notifications (new or completed)
  channel.consume(REVIEW_NOTIFICATION_QUEUE, async msg => {
    if (!msg) return;
    try {
      const rawContent = msg.content.toString();
      console.log('📨 Raw message from review_notifications:', rawContent);

      const event = JSON.parse(rawContent);
      console.log('✅ Parsed review notification:', event);

      let emails = [];

      if (event.studentId) {
        const entry = await UserEmail.findOne({ studentCode: event.studentId });
        if (entry) emails.push(entry.email);
      }

      console.log('📧 Resolved emails:', emails);

      const html = formatNotification(event);
      for (const email of emails) {
        if (!ALLOWED_EMAILS.has(email)) {
          console.warn(`❌ Blocked email to unauthorized address: ${email}`);
          continue;
        }

        console.log(`📤 Sending email to: ${email}`);
        await sendEmail(email, '📢 ClearSky Notification', html);
      }

      channel.ack(msg);
    } catch (err) {
      console.error('❌ Review notification processing failed:', err);
      channel.nack(msg, false, false);
    }
  });


  // 👤 Fanout (user created)
  channel.consume(q.queue, async msg => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      const { userCode, email } = data;

      if (!userCode || !email) {
        console.warn('⚠️ Invalid user data received (fanout)');
        channel.ack(msg);
        return;
      }

      await UserEmail.updateOne(
        { studentCode: userCode },
        { studentCode: userCode, email },
        { upsert: true }
      );

      console.log(`✅ Stored user (via fanout): ${userCode} → ${email}`);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Fanout handler error:', err);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer();

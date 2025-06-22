const amqp = require('amqplib');
const formatNotification = require('./formatter');
const sendEmail = require('./mailer');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'notifications';

async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Waiting for messages in queue: "${QUEUE_NAME}"`);

    channel.consume(QUEUE_NAME, async msg => {
  if (msg !== null) {
    try {
      const event = JSON.parse(msg.content.toString());

      if (!event.email) {
        console.warn('Event missing email address');
        channel.ack(msg);
        return;
      }

      const notification = formatNotification(event);
      await sendEmail(event.email, 'New NTUA Test Notification', notification);

      channel.ack(msg);
    } catch (err) {
      console.error('Failed to process message:', err);
      channel.nack(msg, false, false);
    }
  }
});
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}

startConsumer();

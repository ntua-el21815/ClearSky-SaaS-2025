const amqp = require('amqplib');
const { calculateStatistics } = require('./statistics');
const CourseStatistics = require('./model/courseStatistics');
const connectDB = require('./db');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'grades';

async function startConsumer() {
  await connectDB();

  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`📥 Waiting for messages in queue "${QUEUE_NAME}"...`);

    channel.consume(QUEUE_NAME, async msg => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const { courseId, gradeSheetId, data } = content;

          if (!courseId || !gradeSheetId || !Array.isArray(data)) {
            console.warn('⚠️ Invalid input received from queue');
            channel.ack(msg);
            return;
          }

          const stats = calculateStatistics(data);

          const saved = await CourseStatistics.create({
            courseId,
            gradeSheetId,
            ...stats
          });

          console.log(`✅ Statistics saved for ${courseId} (ID: ${saved._id})`);
          channel.ack(msg);
        } catch (err) {
          console.error('❌ Error processing message:', err);
          channel.nack(msg, false, false); // reject permanently
        }
      }
    });
  } catch (err) {
    console.error('❌ RabbitMQ connection failed:', err);
  }
}

startConsumer();

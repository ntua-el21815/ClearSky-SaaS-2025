require('dotenv').config();
const amqp = require('amqplib');
const connectDB = require('./config/db');
const Course = require('./models/Course');

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://admin:secure21@rabbitmq:5672';
const QUEUE = 'courses';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startConsumer(retries = 10) {
  await connectDB(); // Connect to MongoDB

  while (retries > 0) {
    try {
      console.log('🔌 Connecting to RabbitMQ at:', RABBIT_URL);
      const conn = await amqp.connect(RABBIT_URL);
      const channel = await conn.createChannel();

      await channel.assertQueue(QUEUE, { durable: true });
      console.log(`📥 Waiting for messages on "${QUEUE}"...`);

      channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());

        const course = await Course.create({
          courseId       : payload.courseId,
          name           : payload.courseName,
          academicPeriod : payload.academicPeriod,
          institutionId  : payload.institutionId,
          instructorId   : payload.instructorId
        });


          console.log(`✅ Saved course: ${course.courseId} (${course.name})`);
          channel.ack(msg);

        } catch (err) {
          console.error('❌ Failed to save course:', err.message);
          channel.nack(msg, false, false); // Do not requeue
        }
      });

      // Exit retry loop on success
      break;

    } catch (err) {
      retries--;
      console.error(`❌ RabbitMQ connection failed: ${err.message}`);
      if (retries === 0) {
        console.error('❌ Out of retries. Exiting.');
        process.exit(1);
      } else {
        console.log(`🔁 Retrying in 5s... (${retries} attempts left)`);
        await sleep(5000);
      }
    }
  }
}

startConsumer();

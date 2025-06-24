require('dotenv').config();             // so .env vars still work
const amqp      = require('amqplib');
const connectDB = require('./config/db');
const Course    = require('./models/Course');

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const QUEUE      = 'courses';

(async () => {
  await connectDB();                                    // connect Mongo
  const conn    = await amqp.connect(RABBIT_URL);       // connect RabbitMQ
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  console.log('📥  waiting for messages on "courses" …');

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());

      const course = await Course.create({
        courseId       : payload['Κωδικός μαθήματος'],
        name           : payload['Μάθημα'],
        academicPeriod : payload['Περίοδος δήλωσης'],
        institutionId  : payload.institutionId,
        instructorId   : payload.userId            // optional
      });

      console.log(`✅  saved course ${course.courseId} (${course.name})`);
      channel.ack(msg);

    } catch (err) {
      console.error('❌  failed to save course:', err.message);
      channel.nack(msg, false, false);                 // dead-letter
    }
  });
})();
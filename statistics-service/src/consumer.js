/* --------------------------------------------------
 * statistics-service - consumer.js
 * -------------------------------------------------- */
const amqp = require('amqplib');
const { calculateStatistics } = require('./statistics');
const CourseStatistics = require('./model/courseStatistics');
const connectDB = require('./db');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
const QUEUE_NAME = 'statistics';

const MAX_RETRIES = 12;
const RETRY_DELAY_MS = 5000;

let dbReady = false;
async function ensureDB() {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
}

async function startConsumer(attempt = 1) {
  await ensureDB();

  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();

    await ch.assertQueue(QUEUE_NAME, { durable: true });
    ch.prefetch(1);

    console.log('🟢 statistics-service connected to RabbitMQ, waiting for messages…');

    conn.on('close', () => {
      console.warn('statistics-service: RabbitMQ connection closed — reconnecting…');
      setTimeout(() => startConsumer(), RETRY_DELAY_MS);
    });

    ch.consume(QUEUE_NAME, async msg => {
      if (!msg) return;

      try {
        const parsed = JSON.parse(msg.content.toString());

        const wrapper = parsed?.data?.data ?? parsed?.data ?? parsed;

        const gradesArray = wrapper?.grades;
        const courseId =
          wrapper?.courseId ||
          wrapper?.metadata?.courseId ||
          'UNKNOWN';

        const academicPeriod =
          wrapper?.academicPeriod ||
          wrapper?.metadata?.academicPeriod ||
          'UNKNOWN';

        const institutionId =
          wrapper?.institutionId ||
          wrapper?.metadata?.institutionId ||
          'UNKNOWN';

        if (!Array.isArray(gradesArray)) {
          console.warn('⚠️ Invalid input: grades not found');
          ch.ack(msg);
          return;
        }

        const transformed = gradesArray.map(stu => ({
          studentId: stu['studentId'],
          finalGrade: stu['grade'],
          questionsRaw: Object.fromEntries(
            Object.entries(stu.responses || {}).map(([k, v]) => [`Q${k.padStart(2, '0')}`, v])
          )
        }));

        const stats = calculateStatistics(transformed);

        const saved = await CourseStatistics.findOneAndUpdate(
          { courseId, institutionId, academicPeriod },
          {
            $set: {
              ...stats,
              calculatedAt: new Date()
            }
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Statistics saved or updated for ${courseId} (ID: ${saved._id})`);
        ch.ack(msg);

      } catch (err) {
        console.error('❌ Error processing message:', err);
        ch.nack(msg, false, false);
      }
    });

  } catch (err) {
    console.error(`statistics-service: RabbitMQ connect failed (attempt ${attempt}):`, err.message);
    if (attempt < MAX_RETRIES) {
      setTimeout(() => startConsumer(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error('statistics-service: ❌ gave up connecting to RabbitMQ');
    }
  }
}

startConsumer();

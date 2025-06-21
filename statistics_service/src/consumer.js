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
          const parsed = JSON.parse(msg.content.toString());

          const wrapper = parsed?.data?.data;
          const gradesArray = wrapper?.grades;
          const courseId = wrapper?.["Τμήμα Τάξης"] || "UNKNOWN";
          const gradeSheetId = wrapper?.["Περίοδος δήλωσης"] || "UNKNOWN";

          if (!Array.isArray(gradesArray)) {
            console.warn('⚠️ Invalid input: grades not found');
            channel.ack(msg);
            return;
          }

          // Transform data into expected format
          const transformed = gradesArray.map(student => ({
            studentId: student["Αριθμός Μητρώου"],
            finalGrade: student["Βαθμολογία"],
            questionsRaw: Object.fromEntries(
              Object.entries(student.responses || {}).map(([k, v]) => [`Q${k.padStart(2, '0')}`, v])
            )
          }));

          const stats = calculateStatistics(transformed);

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
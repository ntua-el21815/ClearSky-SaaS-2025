// user-management-service/courseConsumer.js
require("dotenv").config();
const amqp      = require("amqplib");
const User      = require("./models/User");
const connectDB = require("./config/db");

const RABBITMQ_URL   = process.env.RABBITMQ_URL || "amqp://localhost";
const EXCHANGE_NAME  = "grade.course.assign";      // topic ή fanout
const QUEUE_NAME     = "user-management.course.queue";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function startCourseConsumer() {
  await connectDB();                      // ⬅️  σύνδεση Mongo

  let retries = 5;
  while (retries) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);
      const ch   = await conn.createChannel();

      await ch.assertExchange(EXCHANGE_NAME, "fanout", { durable: false });
      const q = await ch.assertQueue(QUEUE_NAME, { durable: true });
      await ch.bindQueue(q.queue, EXCHANGE_NAME, "");

      console.log(`🟢  [UM] Listening on "${EXCHANGE_NAME}" → ${QUEUE_NAME}`);

      ch.consume(q.queue, async (msg) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());
          /* payload expected:
             {
               "instructorId": "6859…",
               "courseId":     "CS101",
               "courseName":   "Software Engineering",
               "academicPeriod": "2025-Jun"
             }
          */
          await upsertCourse(payload);
          ch.ack(msg);
        } catch (err) {
          console.error("[UM] Failed to process course event:", err.message);
          ch.nack(msg, false, false);     // discard (no requeue)
        }
      });

      return;                             // --> connected OK
    } catch (err) {
      retries--;
      console.error(`❌ RabbitMQ down. Retry in 5s… (${retries} left)`);
      await sleep(5000);
    }
  }
  process.exit(1);
}

async function upsertCourse({ userId, courseId, courseName, academicPeriod }) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.role !== "instructor") throw new Error("User is not instructor");

  // ensure courses field is initialized (just in case)
  if (!Array.isArray(user.courses)) {
    user.courses = [];
  }

  const exists = user.courses.some(
    c => c.courseId === courseId &&
         (!academicPeriod || c.academicPeriod === academicPeriod)
  );
  if (exists) return;

  user.courses.push({ courseId, courseName, academicPeriod });
  await user.save();

  console.log(`[UM] Added ${courseId} (${academicPeriod ?? "—"}) to instructor ${userId}`);
}

module.exports = startCourseConsumer;
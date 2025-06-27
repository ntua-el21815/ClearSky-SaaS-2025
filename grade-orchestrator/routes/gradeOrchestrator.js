/* -------------------------------------------------- *
 * grade-orchestrator/routes/gradeOrchestrator.js     *
 * -------------------------------------------------- */
const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');
const amqplib  = require('amqplib');

const router = express.Router();
const upload = multer({ dest: 'tempUploads/' });

/* ---------- service URLs ---------- */
const CREDIT_API = (process.env.CREDIT_SERVICE_URL || '')
  .replace(/\/$/, '') + '/api/credits';
const GRADE_API  = (process.env.GRADE_SERVICE_URL  || '')
  .replace(/\/$/, '') + '/gradeRoutes';
const STATISTICS_API = (process.env.STATISTICS_SERVICE_URL || '')
  .replace(/\/$/, '');
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

//const USER_SERVICE_API = (process.env.USER_MANAGEMENT_SERVICE_URL || '').replace(/\/$/, '') + '/users';


/* ---------- RabbitMQ bootstrap with retry ---------- */
let mqChannel;
const MAX_RETRIES   = 12;
const RETRY_DELAYMS = 5_000;

async function connectRabbitMQ (attempt = 1) {
  try {
    const conn = await amqplib.connect(RABBIT_URL);
    mqChannel  = await conn.createChannel();

    /* queues we use */
    await mqChannel.assertQueue('statistics',    { durable: true });
    await mqChannel.assertQueue('notifications', { durable: true });
    await mqChannel.assertQueue('courses',       { durable: true });   // 🆕 new queue
    await mqChannel.assertQueue('coursesAuth',  { durable: true });
    console.log('[orchestrator] 🟢 RabbitMQ channel ready');

    conn.on('close', () => {
      console.warn('[orchestrator] RabbitMQ connection closed — reconnecting…');
      mqChannel = null;
      connectRabbitMQ();
    });
  } catch (err) {
    console.error(`[orchestrator] RabbitMQ connect failed (attempt ${attempt}):`, err.message);
    if (attempt < MAX_RETRIES) {
      setTimeout(() => connectRabbitMQ(attempt + 1), RETRY_DELAYMS);
    } else {
      console.error('[orchestrator] ❌ Gave up connecting to RabbitMQ');
    }
  }
}
connectRabbitMQ();

/* ---------- helper: unwrap axios ---------- */
function formatAxiosError (err, defaultMsg) {
  if (err.response) {
    return {
      fromService : true,
      status      : err.response.status,
      data        : err.response.data,
      msg         : err.response.data?.message || defaultMsg
    };
  }
  if (err.request) {
    return { fromService:false, status:503, msg:defaultMsg, details:err.message };
  }
  return { fromService:false, status:500, msg:defaultMsg, details:err.message };
}

router.post(
  '/api/grade-submissions',
  upload.single('file'),
  async (req, res) => {
    const {
      courseId = 'unknown',
      userCode = 'unknown',
      institutionId = null // 👈 now expected from request
    } = req.body;

    const isFinal = (req.body.final === 'true' || req.body.final === true);
    const finalFlag = Boolean(isFinal);
    const file = req.file;

    if (!userCode || !file || !institutionId) {
      return res.status(400).json({ success: false, error: 'Missing userCode, institutionId, or file' });
    }

    /* ---------- credit logic (only if NOT final) ---------- */
    if (!isFinal) {
      let availableCredits = 0;
      try {
        const bal = await axios.get(`${CREDIT_API}/institution/${institutionId}/balance`);
        ({ availableCredits = 0 } = bal.data);
      } catch (err) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(502).json({
          success: false,
          stage: 'balance-check',
          ...formatAxiosError(err, 'Failed to contact credit-service for balance')
        });
      }

      if (availableCredits < 1) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ success: false, error: 'Insufficient credits' });
      }

      try {
        await axios.post(`${CREDIT_API}/institution/${institutionId}/use`, {
          credits: 1,
          operation: 'upload_grades',
          courseId
        });
      } catch (err) {
        fs.unlinkSync(file.path);
        return res.status(502).json({
          success: false,
          stage: 'credit-use',
          ...formatAxiosError(err, 'Failed while deducting credit')
        });
      }
    }

    /* ---------- forward file to grade-service ---------- */
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    formData.append('final', String(finalFlag));
    formData.append('instructorId', userCode);
    formData.append('institutionId', institutionId); // 👈 directly passed

    let gradeResp;
    try {
      gradeResp = await axios.post(
        `${GRADE_API}/upload-initial`,
        formData,
        { headers: formData.getHeaders() }
      );
    } catch (err) {
      fs.unlinkSync(file.path);
      return res.status(502).json({
        success: false,
        stage: 'grade-upload',
        ...formatAxiosError(err, 'Failed while forwarding file to grade-service')
      });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    /* ---------- publish to RabbitMQ ---------- */
    if (mqChannel) {
      const inner = gradeResp?.data?.data?.data ?? gradeResp?.data?.data ?? {};
      const metadata = inner.metadata || {};

      /* 1. raw grades → statistics */
      try {
        mqChannel.sendToQueue(
          'statistics',
          Buffer.from(JSON.stringify({
            grades: inner.grades,
            metadata,
            institutionId,
            academicPeriod: metadata.academicPeriod
          })),
          { persistent: true }
        );
      } catch (err) {
        console.error('[orchestrator] failed to publish to statistics:', err.message);
      }

      /* 2. GRADES_POSTED → notifications */
      try {
        const emails = [
          ...new Set(
            (inner.grades || [])
              .map(s => (s.academicalEmail || s.email || '').trim())
              .filter(Boolean)
          )
        ];

        console.log('📨 Sending GRADES_POSTED to notifications queue with emails:', emails);

        mqChannel.sendToQueue(
          'notifications',
          Buffer.from(JSON.stringify({ type: 'GRADES_POSTED', emails })),
          { persistent: true }
        );
      } catch (err) {
        console.error('[orchestrator] failed to publish GRADES_POSTED:', err.message);
      }

      /* 3. course-info → courses (only for initial uploads) */
      if (!isFinal) {
        try {
          const courseMsg = {
            academicPeriod: metadata.academicPeriod || null,
            courseName    : metadata.courseName     || null,
            courseId      : metadata.courseId       || null,
            institutionId,
            instructorId  : userCode
          };

          mqChannel.sendToQueue(
            'courses',
            Buffer.from(JSON.stringify(courseMsg)),
            { persistent: true }
          );

          /* 4. course authorization → coursesAuth */
          try {
            const studentUserCodes = [
              ...new Set(
                (inner.grades || [])
                  .map(g => g.studentId)
                  .filter(Boolean)
              )
            ];

            mqChannel.sendToQueue(
              'coursesAuth',
              Buffer.from(JSON.stringify({
                courseId       : metadata.courseId,
                courseName     : metadata.courseName,
                academicPeriod : metadata.academicPeriod,
                instructorId   : userCode,
                studentUserCodes
              })),
              { persistent: true }
            );

            console.log('[orchestrator] 🔐 courseAuth sent to coursesAuth queue');
          } catch (err) {
            console.error('[orchestrator] failed to publish coursesAuth:', err.message);
          }

          console.log('[orchestrator] 📚 course info sent to courses queue');
        } catch (err) {
          console.error('[orchestrator] failed to publish course info:', err.message);
        }
      }
    }


    /* ---------- success response ---------- */
    return res.status(200).json({
      success : true,
      message : 'Upload complete',
      data    : gradeResp.data
    });
  }
);


router.get('/api/grades/by-course', async (req, res) => {
  const { courseId, academicPeriod, institutionId } = req.query;

  if (!courseId || !academicPeriod || !institutionId) {
    return res.status(400).json({
      success: false,
      message: "Missing courseId, academicPeriod, or institutionId in query."
    });
  }

  try {
    const response = await axios.get(`${GRADE_API}`, {
      params: { courseId, academicPeriod, institutionId }
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch grades by course')
    });
  }
});


router.get('/api/grades/student', async (req, res) => {
  try {
    const response = await axios.get(`${GRADE_API}/student`, {
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch student grades')
    });
  }
});


//λήψη όλων των στατιστικών
router.get('/api/statistics/all', async (req, res) => {
  try {
    const response = await axios.get(`${STATISTICS_API}/statistics/all`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch all statistics')
    });
  }
});

// στατιστικά ανά μάθημα (with institutionId + academicPeriod)
router.get('/api/statistics/course/:courseId', async (req, res) => {
  const { institutionId, academicPeriod } = req.query;
  const courseId = req.params.courseId;

  if (!courseId || !institutionId || !academicPeriod) {
    return res.status(400).json({
      success: false,
      message: 'Missing courseId, institutionId, or academicPeriod.'
    });
  }

  try {
    const response = await axios.get(`${STATISTICS_API}/statistics/course/${courseId}`, {
      params: { institutionId, academicPeriod }
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch statistics for course')
    });
  }
});


// get initial courses that are not final for instructorCode
router.get('/api/grades/initial-courses', async (req, res) => {
  try {
    const response = await axios.get(`${GRADE_API}/initial-courses`, {
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch initial-only courses')
    });
  }
});

// GET course status (Open/Closed) by courseId, academicPeriod, and institutionId
router.get('/api/grades/course-status', async (req, res) => {
  const { courseId, academicPeriod, institutionId } = req.query;

  // Validate required query params
  if (!courseId || !academicPeriod || !institutionId) {
    return res.status(400).json({
      success: false,
      message: 'Missing courseId, academicPeriod, or institutionId.'
    });
  }

  try {
    const response = await axios.get(`${GRADE_API}/course-status`, {
      params: { courseId, academicPeriod, institutionId }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      success: false,
      ...formatAxiosError(err, 'Failed to fetch course status')
    });
  }
});


module.exports = router;

/* -------------------------------------------------- *
 * grade-orchestrator/routes/gradeOrchestrator.js     *
 * -------------------------------------------------- */
const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');
const amqplib  = require('amqplib');

const router  = express.Router();
const upload  = multer({ dest: 'tempUploads/' });

/* ---------- service URLs ---------- */
const CREDIT_API = (process.env.CREDIT_SERVICE_URL || '')
                    .replace(/\/$/, '') + '/api/credits';
const GRADE_API  = (process.env.GRADE_SERVICE_URL  || '')
                    .replace(/\/$/, '') + '/gradeRoutes';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

/* ---------- RabbitMQ bootstrap with retry ---------- */
let mqChannel;
const MAX_RETRIES   = 12;           // ~1 λεπτό συνολικά
const RETRY_DELAYMS = 5_000;        // 5″ ανά προσπάθεια

async function connectRabbitMQ(attempt = 1) {
  try {
    const conn = await amqplib.connect(RABBIT_URL);
    mqChannel  = await conn.createChannel();
    await mqChannel.assertQueue('statistics',    { durable: true });
    await mqChannel.assertQueue('notifications', { durable: true }); // 🔔

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
function formatAxiosError(err, defaultMsg) {
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

/* ================================================= *
 *  MAIN ENDPOINT                                    *
 * ================================================= */
router.post(
  '/api/grade-submissions',
  upload.single('file'),
  async (req, res) => {
    const { institutionId, courseId = 'unknown' } = req.body;
    const isFinal = (req.body.final === 'true' || req.body.final === true);
    const file    = req.file;

    if (!institutionId || !file) {
      return res.status(400).json({ success:false, error:'Missing institutionId or file' });
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
          success:false,
          stage:'balance-check',
          ...formatAxiosError(err,'Failed to contact credit-service for balance')
        });
      }

      if (availableCredits < 1) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ success:false, error:'Insufficient credits' });
      }

      /* deduct one credit */
      try {
        await axios.post(`${CREDIT_API}/institution/${institutionId}/use`, {
          credits  : 1,
          operation: 'upload_grades',
          courseId
        });
      } catch (err) {
        fs.unlinkSync(file.path);
        return res.status(502).json({
          success:false,
          stage:'credit-use',
          ...formatAxiosError(err,'Failed while deducting credit')
        });
      }
    }

    /* ---------- forward file to grade-service ---------- */
    const formData = new FormData();
    formData.append('file',   fs.createReadStream(file.path));
    formData.append('final',  String(isFinal));
    formData.append('courseId', courseId);

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
        success:false,
        stage:'grade-upload',
        ...formatAxiosError(err,'Failed while forwarding file to grade-service')
      });
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    /* ---------- publish to RabbitMQ ---------- */
    if (mqChannel) {
      /* 1. raw grades → statistics queue */
      try {
        mqChannel.sendToQueue(
          'statistics',
          Buffer.from(JSON.stringify(gradeResp.data)),
          { persistent:true }
        );
      } catch (err) {
        console.error('[orchestrator] failed to publish to statistics:', err.message);
      }

      /* 2. GRADES_POSTED notification → notifications queue */
      try {
        const gradesArr = gradeResp?.data?.data?.data?.grades
                       ?? gradeResp?.data?.data?.grades
                       ?? [];
        const emails = [
          ...new Set(
            gradesArr
              .map(s => (s['Ακαδημαϊκό E-mail'] || s.email || '').trim())
              .filter(Boolean)
          )
        ];

        const notifMsg = {
          type  : 'GRADES_POSTED',
          emails
        };

        mqChannel.sendToQueue(
          'notifications',
          Buffer.from(JSON.stringify(notifMsg)),
          { persistent:true }
        );

        console.log(`[orchestrator] 📨 GRADES_POSTED sent with ${emails.length} emails`);
      } catch (err) {
        console.error('[orchestrator] failed to publish GRADES_POSTED:', err.message);
      }
    }

    /* ---------- success response to client ---------- */
    return res.status(200).json({
      success : true,
      message : 'Upload complete',
      data    : gradeResp.data
    });
  }
);

module.exports = router;

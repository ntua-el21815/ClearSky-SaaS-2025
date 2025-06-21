const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');

const router  = express.Router();
const upload  = multer({ dest: 'tempUploads/' });

const CREDIT_API = (process.env.CREDIT_SERVICE_URL || '').replace(/\/$/, '') + '/api/credits';
const GRADE_API  = (process.env.GRADE_SERVICE_URL  || '').replace(/\/$/, '') + '/gradeRoutes';

/* ---------- helper to unwrap axios errors ---------- */
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

/* ========== MAIN ENDPOINT ========== */
router.post('/api/grade-submissions', upload.single('file'), async (req, res) => {
  const { institutionId, courseId = 'unknown' } = req.body;
  const isFinal = req.body.final === 'true';
  const file    = req.file;

  if (!institutionId || !file) {
    return res.status(400).json({ success:false, error:'Missing institutionId or file' });
  }

  /* -------------------------------------------------------------------- *
   * If NOT final, we must check and deduct credits                       *
   * -------------------------------------------------------------------- */
  if (!isFinal) {
    /* 1. balance check -------------------------------------------------- */
    let availableCredits = 0;
    try {
      const balanceResp = await axios.get(
        `${CREDIT_API}/institution/${institutionId}/balance`
      );
      ({ availableCredits = 0 } = balanceResp.data);
    } catch (err) {
      fs.unlinkSync(file.path);
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

    /* 2. deduct one credit --------------------------------------------- */
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

  /* 3. forward Excel to grade-service ---------------------------------- */
  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));
  formData.append('final', isFinal.toString());
  formData.append('courseId', courseId);

  try {
    const gradeResp = await axios.post(
      `${GRADE_API}/upload-initial`,
      formData,
      { headers: formData.getHeaders() }
    );
    fs.unlinkSync(file.path);
    return res.status(200).json({
      success : true,
      message : 'Upload complete',
      data    : gradeResp.data
    });
  } catch (err) {
    fs.unlinkSync(file.path);
    return res.status(502).json({
      success:false,
      stage:'grade-upload',
      ...formatAxiosError(err,'Failed while forwarding file to grade-service')
    });
  }
});

module.exports = router;



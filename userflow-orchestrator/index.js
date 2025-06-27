const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const { initRabbit, publishUserCreated,publishGoogleSignup} = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const USER_AUTH_SERVICE_URL = process.env.USER_AUTH_SERVICE_URL || 'http://localhost:5000';
const USER_MANAGEMENT_SERVICE_URL = process.env.USER_MANAGEMENT_SERVICE_URL || 'http://localhost:6000';
const CREDIT_SERVICE_URL = process.env.CREDIT_SERVICE_URL || 'http://localhost:3000';
const INSTITUTION_SERVICE_URL = process.env.INSTITUTION_SERVICE_URL || 'http://localhost:7000';

// Auth orchestration endpoint
app.post('/api/auth', async (req, res) => {

  let token, email, password;
  if (req.body && typeof req.body === 'object') {
    if ('token' in req.body) token = req.body.token;
    if ('email' in req.body) email = req.body.email;
    if ('password' in req.body) password = req.body.password;
  }

  console.log('🔍 Auth request received:', { token, email, password });
  try {
    if (token) {
      try {
        const verifyResponse = await axios.get(`${USER_AUTH_SERVICE_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return res.json({
          success: true,
          message: 'Token is valid',
          user: verifyResponse.data.user,
          token
        });
      } catch (verifyErr) {
        console.warn('⚠️ Token verification failed:', verifyErr.response?.data || verifyErr.message);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const loginResponse = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/login`, { email, password });

    return res.json({
      success: true,
      message: 'Login successful',
      user: loginResponse.data.user,
      token: loginResponse.data.token
    });

  } catch (err) {
    console.error('❌ Auth orchestration error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: err.response?.data || err.message
    });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password, fullName, role, userCode, repCode } = req.body;

  if (!email || !password || !fullName || !role || !userCode || !repCode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, password, fullName, role, userCode, repCode'
    });
  }

  let institutionId;
  try {
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${repCode}`, { timeout: 5000 });
    institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Creator user does not have an institutionId'
      });
    }
  } catch (err) {
    console.error('Failed to fetch creator user:', err.message);
    return res.status(502).json({
      success: false,
      error: 'Failed to fetch creator user',
      details: err.response?.data || err.message
    });
  }

  try {
    const registerResponse = await axios.post(`${USER_MANAGEMENT_SERVICE_URL}/users/register`, {
      email,
      password,
      fullName,
      role,
      userCode,
      institutionId
    }, { timeout: 5000 });

    const createdUser = registerResponse.data.user;
    const userId = createdUser.id;

    console.log("Forwarding user ID:", createdUser.id);

    // Publish to RabbitMQ with ID
    await publishUserCreated({
      id: userId,
      email,
      password,
      fullName,
      role,
      userCode,
      institutionId
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      user: createdUser,
      token: registerResponse.data.token
    });

  } catch (err) {
    console.error('Signup orchestration error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Signup failed',
      details: err.response?.data || err.message
    });
  }
});


app.post('/api/credits/user-code/:userCode/add', async (req, res) => {
  const { userCode } = req.params;
  const { credits } = req.body;

  try {
    // Step 1: Get institutionId from user-management service using userCode
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Forward the credit addition request to the credit service
    const response = await axios.post(
      `${CREDIT_SERVICE_URL}/api/credits/institution/${institutionId}/add`,
      { credits }
    );

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ Error processing credit addition:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to add credits',
      error: error.response?.data || error.message
    });
  }
});



// Forward GET /users/:id/courses to user management service
app.get('/api/users/by-code/:userCode/courses', async (req, res) => {
  try {
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${req.params.userCode}`);
    const userId = userResp.data._id;
    const role = userResp.data.role;

    if (role !== 'student') {
      return res.status(400).json({ message: 'Not a student' });
    }

    const response = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}/courses`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error fetching student courses:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get student courses',
      error: error.response?.data || error.message
    });
  }
});


// Forward GET /users/:id/instructor-courses
app.get('/api/users/by-code/:userCode/instructor-courses', async (req, res) => {
  try {
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${req.params.userCode}`);
    const userId = userResp.data._id;
    const role = userResp.data.role;

    if (role !== 'instructor') {
      return res.status(400).json({ message: 'Not an instructor' });
    }

    const response = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}/instructor-courses`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error fetching instructor courses:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get instructor courses',
      error: error.response?.data || error.message
    });
  }
});


// get users for institution
app.get('/api/users/count/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management service
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Use institutionId to get user count
    const countResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/count/by-institution/${institutionId}`);
    res.status(countResponse.status).json(countResponse.data);

  } catch (error) {
    console.error('❌ Error fetching user count by institution:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get user count by institution',
      error: error.response?.data || error.message
    });
  }
});

// GET available credits for institution using user
app.get('/api/credits/by-user/:userCode/available', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Get available credits from credit service
    const creditResponse = await axios.get(`${CREDIT_SERVICE_URL}/api/credits/institution/${institutionId}/balance`);
    const { availableCredits } = creditResponse.data;

    return res.json({ institutionId, availableCredits });

  } catch (error) {
    console.error('❌ Error fetching available credits:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get available credits',
      error: error.response?.data || error.message
    });
  }
});

// GET /api/institution/courses/by-user/:userCode
app.get('/api/institution/courses/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management service
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Call institution service to get courses by institutionId
    const coursesResp = await axios.get(`${INSTITUTION_SERVICE_URL}/institutions/${institutionId}/courses`);

    return res.status(200).json({
      success: true,
      institutionId,
      courses: coursesResp.data
    });

  } catch (err) {
    console.error('❌ Failed to fetch courses by userCode:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Failed to get courses for user\'s institution',
      error: err.response?.data || err.message
    });
  }
});

// post institution info
app.post('/api/institution/create/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;
  const { name, region, contactPhone, address } = req.body;

  if (!name || !region || !contactPhone || !address) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, region, contactPhone, address'
    });
  }

  try {
    // Step 1: Get institutionId from user-management service
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Call institution service to create institution
    const institutionData = {
      id: institutionId,
      name,
      region,
      contactPhone,
      address
    };

    const createResp = await axios.post(`${INSTITUTION_SERVICE_URL}/institutions`, institutionData);

    return res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      institution: createResp.data
    });

  } catch (error) {
    console.error('❌ Failed to create institution:', error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to create institution',
      error: error.response?.data || error.message
    });
  }
});


// get institution info based on usercode of representative
app.get('/api/institution/info/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management service
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Fetch institution info from institution service
    const institutionResp = await axios.get(`${INSTITUTION_SERVICE_URL}/institutions/${institutionId}`);

    return res.status(200).json({
      success: true,
      institution: institutionResp.data
    });

  } catch (err) {
    console.error('❌ Error fetching institution info:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Failed to get institution info',
      error: err.response?.data || err.message
    });
  }
});


// get user info by userCode 
app.get('/api/users/info/by-code/:userCode', async (req, res) => {
  const { userCode } = req.params;

  try {
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      user: userResponse.data
    });

  } catch (err) {
    console.error('❌ Error fetching user info by userCode:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Failed to get user by userCode',
      error: err.response?.data || err.message
    });
  }
});

// PUT /api/institution/update/by-user/:userCode
app.put('/api/institution/update/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;
  const updateFields = req.body;

  if (!updateFields || typeof updateFields !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid update data'
    });
  }

  try {
    // Step 1: Get institutionId from user-management service
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Forward the update to institution-service
    const updateResp = await axios.put(
      `${INSTITUTION_SERVICE_URL}/institutions/${institutionId}`,
      updateFields,
      { timeout: 5000 }
    );

    return res.status(200).json({
      success: true,
      message: 'Institution updated successfully',
      institution: updateResp.data
    });

  } catch (err) {
    console.error('❌ Failed to update institution:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Failed to update institution',
      error: err.response?.data || err.message
    });
  }
});

// sign up with google - connect google account 
app.post('/api/users/google-signup', async (req, res) => {
  const { userCode, googleAccessToken } = req.body;

  if (!userCode || !googleAccessToken) {
    return res.status(400).json({ success: false, error: "Missing userCode or googleAccessToken" });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleAccessToken });

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data: googleUser } = await oauth2.userinfo.get();

    const googleId = googleUser.id;
    const gmail = googleUser.email;
    const fullName = googleUser.name;

    if (!gmail.endsWith("@gmail.com")) {
      return res.status(400).json({ success: false, error: "Only Gmail addresses allowed" });
    }

    const response = await axios.post(`${USER_MANAGEMENT_SERVICE_URL}/users/link-google-account`, {
      userCode,
      googleId,
      gmail,
      fullName
    });

    // 👉 Publish to google.info queue
    await publishGoogleSignup({
      userCode,
      gmail,
      googleId
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.error('❌ Error during Google signup:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Failed to complete Google signup',
      error: err.response?.data || err.message
    });
  }
});


app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:8100/oauth2callback'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: googleUser } = await google.oauth2({ auth: oauth2Client, version: 'v2' }).userinfo.get();

    // 🔁 Τώρα redirect στη student_grade_statistics.html με το accessToken σαν query param
    const redirectUrl = `http://127.0.0.1:5500/frontend_new/student_grade_statistics.html?token=${tokens.access_token}`;
    return res.redirect(redirectUrl);

  } catch (err) {
    console.error('❌ Google callback error:', err.message);
    return res.status(500).send('Google OAuth failed');
  }
});

// sign in with google via token 
app.post('/api/auth/google', async (req, res) => {
  const { googleId, gmail } = req.body;

  if (!googleId || !gmail) {
    return res.status(400).json({ success: false, error: 'Missing googleId or gmail' });
  }

  try {
    const loginResp = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/login/google`, {
      googleId,
      gmail
    });

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      user: loginResp.data.user,
      token: loginResp.data.token
    });
  } catch (err) {
    console.error('❌ Google login error:', err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: 'Google login failed',
      error: err.response?.data || err.message
    });
  }
});

// sign in with google via email 
app.post('/api/auth/google-login', async (req, res) => {
  const { gmail } = req.body;

  if (!gmail) {
    return res.status(400).json({ success: false, error: "Missing Gmail address" });
  }

  try {
    const response = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/login/gmail`, { gmail });
    return res.status(200).json({ success: true, ...response.data });
  } catch (err) {
    console.error("❌ Google login via Gmail failed:", err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: "Google login failed",
      error: err.response?.data || err.message
    });
  }
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-orchestrator', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Orchestrator running at http://localhost:${PORT}`);
});

// 👇 Start RabbitMQ connection (with retry logic in rabbitmq.js)
initRabbit();

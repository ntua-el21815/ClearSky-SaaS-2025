const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Config
const USER_AUTH_SERVICE_URL = process.env.USER_AUTH_SERVICE_URL || 'http://user-auth-service:5000';


// Auth orchestration endpoint
app.post('/api/auth', async (req, res) => {
  const { token, email, password } = req.body;

  try {
    // Case 1: Έχουμε token
    if (token) {
      try {
        const verifyResponse = await axios.get(`${USER_AUTH_SERVICE_URL}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000
        });

        return res.json({
          success: true,
          message: 'Token is valid',
          user: verifyResponse.data.user,
          token
        });
      } catch (verifyErr) {
        console.warn('Invalid token, will fallback to login.');
        // συνεχίζουμε σε login
      }
    }

    // Case 2: Δεν έχουμε token ή είναι άκυρο, κάνε login
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const loginResponse = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/login`, {
      email,
      password
    }, { timeout: 5000 });

    return res.json({
      success: true,
      message: 'Login successful',
      user: loginResponse.data.user,
      token: loginResponse.data.token
    });

  } catch (err) {
    console.error('Auth orchestration error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: err.response?.data || err.message
    });
  }
});


// Signup orchestration endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, password, fullName, role'
    });
  }

  try {
    const registerResponse = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/register`, {
      email,
      password,
      fullName,
      role
    }, { timeout: 5000 });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      user: registerResponse.data.user,
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



// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-orchestrator',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth Orchestrator running on http://localhost:${PORT}`);
});

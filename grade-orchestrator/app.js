require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const gradeOrchestrator = require('./routes/gradeOrchestrator');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(gradeOrchestrator);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'grade-orchestrator' });
});

app.listen(PORT, () => {
  console.log(`Grade Orchestrator running on port ${PORT}`);
});

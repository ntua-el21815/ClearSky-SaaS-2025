const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db');
const controller = require('./src/controller'); // ✅ Εδώ

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Statistics Service is running!');
});

// API endpoints
app.post('/statistics/save', controller.handleStatisticsSave);
app.get('/statistics/all', controller.getAllStatistics);
app.post('/statistics/calculate', controller.calculateStatisticsFromInput);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Routes
const institutionRoutes = require('./routes/institutionRoutes');
app.use('/institutions', institutionRoutes);

app.get('/', (req, res) => {
  res.send('Institution Service is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

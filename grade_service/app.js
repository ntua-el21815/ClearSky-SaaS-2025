console.log("app.js is executing");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

const express = require("express");
const app = express();
const gradeRoutes = require("./routes/gradeRoutes");
require("dotenv").config();

app.use(express.json());
app.use("/gradeRoutes", gradeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Grade Upload Service listening on port ${PORT}`);
});

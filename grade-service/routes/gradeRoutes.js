const multer = require("multer");
const express = require("express");
const gradeController = require("../controllers/gradeController");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./"),
  filename: (req, file, cb) => cb(null, "grades.xlsx"),
});
const upload = multer({ storage });

router.post("/upload-initial", upload.single("file"), gradeController.uploadGrades);

router.get("/", gradeController.getGradesByCourse);

module.exports = router;
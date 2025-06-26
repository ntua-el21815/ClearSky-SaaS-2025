const multer = require("multer");
const fs = require("fs")
const express = require("express");
const gradeController = require("../controllers/gradeController");
const router = express.Router();

//ensure ./upload exists
if (!fs.existsSync("upload")) {
  fs.mkdirSync("upload", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "upload/"),
  filename: (req, file, cb) => cb(null, "grades.xlsx"),
});
const upload = multer({ storage });

router.post("/upload-initial", upload.single("file"), gradeController.uploadGrades);

router.get("/", gradeController.getGradesByCourse);

router.get("/student", gradeController.getStudentGradesById);

router.get("/initial-courses", gradeController.getInitialCourses);

module.exports = router;
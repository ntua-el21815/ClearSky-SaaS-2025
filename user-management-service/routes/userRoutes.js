const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  getUserByCode,
  getUsersByInstitution,
  assignUserCode,
  registerUser,
  getCoursesForStudent,
  getCoursesForInstructor,
  getUserCountByInstitution
} = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/by-code/:code", getUserByCode);
router.get("/by-institution/:institutionId", getUsersByInstitution);
router.get("/count/by-institution/:institutionId", getUserCountByInstitution); // ✅ Added

router.get("/:id/courses", getCoursesForStudent);
router.get("/:id/instructor-courses", getCoursesForInstructor);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.post("/assign-code", assignUserCode);

module.exports = router;

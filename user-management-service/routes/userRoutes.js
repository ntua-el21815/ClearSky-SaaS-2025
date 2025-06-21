const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, getUserByCode, getUsersByInstitution, assignUserCode, registerUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/by-code/:code", getUserByCode);
router.get("/by-institution/:institutionId", getUsersByInstitution);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.post("/assign-code", assignUserCode);

module.exports = router;

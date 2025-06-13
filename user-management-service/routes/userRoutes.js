const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, getUserByCode, getUsersByInstitution, assignUserCode } = require("../controllers/userController");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.get("/by-code/:code", getUserByCode);
router.get("/by-institution/:institutionId", getUsersByInstitution);
router.post("/assign-code", assignUserCode);

module.exports = router;
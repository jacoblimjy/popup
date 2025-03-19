const express = require("express");
const router = express.Router();
const llmController = require("../controllers/llmController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.post(
  "/questions/generate",
  authenticateToken,
  authorizeRole([1]), // Role ID 1 for admin
  llmController.generateQuestions
);

module.exports = router;

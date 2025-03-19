const express = require("express");
const router = express.Router();
const llmController = require("../controllers/llmController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post(
  "/questions/generate",
  authenticateToken,
  llmController.generateQuestions
);

module.exports = router;

const express = require("express");
const router = express.Router();
const llmController = require("../controllers/llmController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.post(
  "/questions/generate",
  authenticateToken,
  authorizeRole([1]), 
  llmController.generateQuestions
);

module.exports = router;

const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const adminOnly = [authenticateToken, authorizeRole([1])];

const authenticatedUser = [authenticateToken];

router.post("/", adminOnly, questionController.createQuestion);

router.post("/bulk", adminOnly, questionController.createQuestionsBulk);

router.get("/", authenticatedUser, questionController.getQuestions);

router.get("/:id", authenticatedUser, questionController.getQuestionById);

router.put("/:id", adminOnly, questionController.updateQuestion);

router.delete("/:id", adminOnly, questionController.deleteQuestion);

module.exports = router;

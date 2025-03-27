const express = require("express");
const router = express.Router();
const pendingQuestionController = require("../controllers/pendingQuestionController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const adminOnly = [authenticateToken, authorizeRole([1])];

router.post("/", adminOnly, pendingQuestionController.createPendingQuestion);

router.post(
  "/bulk",
  adminOnly,
  pendingQuestionController.createPendingQuestionsBulk
);

router.post(
  "/convert/:id",
  adminOnly,
  pendingQuestionController.convertPendingQuestionToQuestion
);

router.get("/", adminOnly, pendingQuestionController.getPendingQuestions);

router.get("/:id", adminOnly, pendingQuestionController.getPendingQuestionById);

router.put("/:id", adminOnly, pendingQuestionController.updatePendingQuestion);

router.delete(
  "/:id",
  adminOnly,
  pendingQuestionController.deletePendingQuestion
);

module.exports = router;

const express = require("express");
const router = express.Router();
const attemptedQuestionController = require("../controllers/attemptedQuestionController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticateToken,
  attemptedQuestionController.createAttemptedQuestion
);
router.post(
  "/bulk",
  authenticateToken,
  attemptedQuestionController.createAttemptedQuestionsBulk
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  attemptedQuestionController.updateAttemptedQuestion
);
router.get(
  "/",
  authenticateToken,
  attemptedQuestionController.getAttemptedQuestionsByFilters
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  attemptedQuestionController.deleteAttemptedQuestionById
);
router.delete(
  "/child/:child_id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  attemptedQuestionController.deleteAttemptedQuestionsByChildId
);

module.exports = router;

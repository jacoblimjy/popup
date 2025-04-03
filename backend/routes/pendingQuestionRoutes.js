const express = require("express");
const router = express.Router();
const pendingQuestionController = require("../controllers/pendingQuestionController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.createPendingQuestion
);

router.post(
  "/bulk",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.createPendingQuestionsBulk
);

router.post(
  "/convert/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.convertPendingQuestionToQuestion
);

router.get(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.getPendingQuestions
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.getPendingQuestionById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.updatePendingQuestion
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  pendingQuestionController.deletePendingQuestion
);

module.exports = router;

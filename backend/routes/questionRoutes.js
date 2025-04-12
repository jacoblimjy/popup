const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");


router.post(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  questionController.createQuestion
);

router.post(
  "/bulk",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  questionController.createQuestionsBulk
);

router.get("/", authenticateToken, questionController.getQuestions);
router.get("/redo/:set_id", authenticateToken, questionController.getRedoQuestions);
router.get("/:id", authenticateToken, questionController.getQuestionById);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  questionController.updateQuestion
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  questionController.deleteQuestion
);

module.exports = router;

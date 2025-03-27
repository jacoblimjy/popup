const express = require("express");
const router = express.Router();
const attemptedQuestionController = require("../controllers/attemptedQuestionController");

router.post("/", attemptedQuestionController.createAttemptedQuestion);
router.post("/bulk", attemptedQuestionController.createAttemptedQuestionsBulk);
router.put("/:id", attemptedQuestionController.updateAttemptedQuestion);
router.get("/", attemptedQuestionController.getAttemptedQuestionsByFilters);
router.delete("/:id", attemptedQuestionController.deleteAttemptedQuestionById);
router.delete("/child/:child_id", attemptedQuestionController.deleteAttemptedQuestionsByChildId);

module.exports = router;
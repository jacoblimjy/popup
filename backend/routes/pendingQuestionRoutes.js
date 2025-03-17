const express = require("express");
const router = express.Router();
const pendingQuestionController = require("../controllers/pendingQuestionController");

router.post("/", pendingQuestionController.createPendingQuestion);

router.post("/bulk", pendingQuestionController.createPendingQuestionsBulk);

router.post("/convert/:id", pendingQuestionController.convertPendingQuestionToQuestion);

router.get("/", pendingQuestionController.getPendingQuestions);

router.get("/:id", pendingQuestionController.getPendingQuestionById);

router.put("/:id", pendingQuestionController.updatePendignQuestion);

router.delete("/:id", pendingQuestionController.deletePendingQuestion);

module.exports = router;

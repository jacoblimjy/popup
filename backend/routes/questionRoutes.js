const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

router.post("/", questionController.createQuestion);

router.post("/bulk", questionController.createQuestionsBulk);

router.get("/", questionController.getQuestions);

router.get("/:id", questionController.getQuestionById);

router.put("/:id", questionController.updateQuestion);

router.delete("/:id", questionController.deleteQuestion);

module.exports = router;

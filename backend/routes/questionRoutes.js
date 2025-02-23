const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

router.post("/", questionController.createQuestion);

router.get("/", questionController.getQuestions);

router.put("/:id", questionController.updateQuestion);

module.exports = router;

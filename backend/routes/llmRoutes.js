const express = require("express");
const router = express.Router();
const llmController = require("../controllers/llmController");

router.post("/generate", llmController.generateQuestions);

module.exports = router;
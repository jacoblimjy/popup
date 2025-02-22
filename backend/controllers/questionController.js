const questionService = require("../services/questionService");

const createQuestion = async (req, res) => {
  try {
    const questionId = await questionService.createQuestion(req.body);
    res.status(201).json({
      questionId,
      message: "Question created successfully",
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(400).json({
      message: "Failed to create question",
      error: error.message,
    });
  }
};

module.exports = {
  createQuestion,
};

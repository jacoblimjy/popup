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

const getQuestions = async (req, res) => {
  try {
    console.log("Query parameters:", req.query);

    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const filters = {};

    if (req.query.topic_id && !isNaN(parseInt(req.query.topic_id))) {
      filters.topic_id = parseInt(req.query.topic_id);
    }

    if (req.query.difficulty_id && !isNaN(parseInt(req.query.difficulty_id))) {
      filters.difficulty_id = parseInt(req.query.difficulty_id);
    }

    console.log("Processed parameters:", { filters, limit, offset }); // Debug log

    const questions = await questionService.getQuestions(
      filters,
      limit,
      offset
    );
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(400).json({
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
};

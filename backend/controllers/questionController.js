const questionService = require("../services/questionService");

const createQuestion = async (req, res) => {
  try {
    const questionId = await questionService.createQuestion(req.body);
    res.status(201).json({
      questionId,
      message: "Question created successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create question",
      error: error.message,
    });
  }
};

const createQuestionsBulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body.questions)) {
      return res
        .status(400)
        .json({ message: "Questions must be provided as an array" });
    }

    const result = await questionService.createQuestionsBulk(
      req.body.questions
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: "Failed to process questions",
      error: error.message,
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const filters = {};

    if (req.query.topic_id && !isNaN(parseInt(req.query.topic_id))) {
      filters.topic_id = parseInt(req.query.topic_id);
    }

    if (req.query.difficulty_id && !isNaN(parseInt(req.query.difficulty_id))) {
      filters.difficulty_id = parseInt(req.query.difficulty_id);
    }

    const questions = await questionService.getQuestions(
      filters,
      limit,
      offset
    );
    res.json(questions);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

const getRedoQuestions = async (req, res) => {
  try {
    const { set_id } = req.params;

    if (!set_id || isNaN(set_id)) {
      return res.status(400).json({ message: "Invalid set ID" });
    }

    const questions = await questionService.getRedoQuestions(parseInt(set_id));
    res.json(questions);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch redo questions",
      error: error.message,
    });
  }
}

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const question = await questionService.getQuestionById(parseInt(id));
    res.json(question);
  } catch (error) {
    if (error.message === "Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to fetch question",
        error: error.message,
      });
    }
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const requiredFields = [
      "question_text",
      "answer_format",
      "correct_answer",
      "distractors",
      "topic_id",
      "difficulty_id",
      "explanation"
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    await questionService.updateQuestion(parseInt(id), req.body);
    const updatedQuestion = await questionService.getQuestionById(parseInt(id));
    res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    if (error.message === "Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to update question",
        error: error.message,
      });
    }
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    await questionService.deleteQuestion(parseInt(id));
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    if (error.message === "Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to delete question",
        error: error.message,
      });
    }
  }
};

module.exports = {
  createQuestion,
  createQuestionsBulk,
  getQuestions,
  getRedoQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

const questionService = require("../services/questionService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const createQuestion = asyncHandler(async (req, res) => {
  const questionId = await questionService.createQuestion(req.body);
  res.status(201).json({
    success: true,
    questionId,
    message: "Question created successfully",
  });
});

const createQuestionsBulk = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.questions)) {
    throw new ApiError(400, "Questions must be provided as an array");
  }

  const result = await questionService.createQuestionsBulk(req.body.questions);
  res.status(201).json(result);
});

const getQuestions = asyncHandler(async (req, res) => {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  const offset = Math.max(0, parseInt(req.query.offset) || 0);

  const filters = {};

  if (req.query.topic_id && !isNaN(parseInt(req.query.topic_id))) {
    filters.topic_id = parseInt(req.query.topic_id);
  }

  if (req.query.difficulty_id && !isNaN(parseInt(req.query.difficulty_id))) {
    filters.difficulty_id = parseInt(req.query.difficulty_id);
  }

  if (req.query.child_id && !isNaN(parseInt(req.query.child_id))) {
    filters.child_id = parseInt(req.query.child_id);
  }

  if (req.query.exclude_seen === "true") {
    filters.exclude_seen = true;
  }

  filters.recycle = req.query.recycle !== "false";

  const questions = await questionService.getQuestions(filters, limit, offset);
  res.json({
    success: true,
    data: questions,
  });
});

const getRedoQuestions = asyncHandler(async (req, res) => {
  const { set_id } = req.params;

  if (!set_id || isNaN(set_id)) {
    throw new ApiError(400, "Invalid set ID");
  }

  const questions = await questionService.getRedoQuestions(parseInt(set_id));
  res.json({
    success: true,
    data: questions,
  });
});

const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid question ID");
  }

  const question = await questionService.getQuestionById(parseInt(id));
  res.json({
    success: true,
    data: question,
  });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid question ID");
  }

  const requiredFields = [
    "question_text",
    "answer_format",
    "correct_answer",
    "distractors",
    "topic_id",
    "difficulty_id",
    "explanation",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    throw new ApiError(400, "Missing required fields", { missingFields });
  }

  await questionService.updateQuestion(parseInt(id), req.body);
  const updatedQuestion = await questionService.getQuestionById(parseInt(id));
  res.json({
    success: true,
    message: "Question updated successfully",
    question: updatedQuestion,
  });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid question ID");
  }

  await questionService.deleteQuestion(parseInt(id));
  res.json({
    success: true,
    message: "Question deleted successfully",
  });
});

module.exports = {
  createQuestion,
  createQuestionsBulk,
  getQuestions,
  getRedoQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
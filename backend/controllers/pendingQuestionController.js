const pendingQuestionService = require("../services/pendingQuestionService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const createPendingQuestion = asyncHandler(async (req, res) => {
  // Validate required fields (keeping the validation from develop branch)
  const requiredFields = [
    "question_text",
    "answer_format", // Ensure this is required
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

  const pendingQuestionId = await pendingQuestionService.createPendingQuestion(req.body);
  res.status(201).json({
    success: true,
    pendingQuestionId,
    message: "Pending Question created successfully",
  });
});

const createPendingQuestionsBulk = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.questions)) {
    throw new ApiError(400, "Pending Questions must be provided as an array");
  }

  const result = await pendingQuestionService.createPendingQuestionsBulk(
    req.body.questions
  );
  res.status(201).json({
    success: true,
    ...result,
  });
});

const convertPendingQuestionToQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid pending question ID");
  }

  const questionId = await pendingQuestionService.convertPendingQuestionToQuestion(id);
  
  res.json({
    success: true,
    questionId,
    message: "Pending question converted to approved question successfully",
  });
});

const getPendingQuestions = asyncHandler(async (req, res) => {
  // Using the higher limit from develop branch (200 instead of 100)
  const limit = Math.max(1, Math.min(200, parseInt(req.query.limit) || 200));
  const offset = Math.max(0, parseInt(req.query.offset) || 0);

  const filters = {};

  if (req.query.topic_id && !isNaN(parseInt(req.query.topic_id))) {
    filters.topic_id = parseInt(req.query.topic_id);
  }

  if (req.query.difficulty_id && !isNaN(parseInt(req.query.difficulty_id))) {
    filters.difficulty_id = parseInt(req.query.difficulty_id);
  }

  const pendingQuestions = await pendingQuestionService.getPendingQuestions(
    filters,
    limit,
    offset
  );
  res.json({
    success: true,
    data: pendingQuestions,
  });
});

const getPendingQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid pending question ID");
  }

  const pendingQuestion = await pendingQuestionService.getPendingQuestionById(
    parseInt(id)
  );
  res.json({
    success: true,
    data: pendingQuestion,
  });
});

const updatePendingQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid pending question ID");
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

  await pendingQuestionService.updatePendingQuestion(parseInt(id), req.body);
  const updatedPendingQuestion =
    await pendingQuestionService.getPendingQuestionById(parseInt(id));
  res.json({
    success: true,
    message: "Pending Question updated successfully",
    question: updatedPendingQuestion,
  });
});

const deletePendingQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new ApiError(400, "Invalid pending question ID");
  }

  await pendingQuestionService.deletePendingQuestion(parseInt(id));
  res.json({
    success: true,
    message: "Pending Question deleted successfully",
  });
});

module.exports = {
  createPendingQuestion,
  createPendingQuestionsBulk,
  convertPendingQuestionToQuestion,
  getPendingQuestions,
  getPendingQuestionById,
  updatePendingQuestion,
  deletePendingQuestion,
};
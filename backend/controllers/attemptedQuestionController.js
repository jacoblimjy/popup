const attemptedQuestionService = require("../services/attemptedQuestionService");
const childrenService = require("../services/childrenService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const createAttemptedQuestion = asyncHandler(async (req, res) => {
  const attemptedQuestion = req.body;
  const aq_id = await attemptedQuestionService.createAttemptedQuestion(
    attemptedQuestion
  );
  res.status(201).json({
    success: true,
    aq_id,
    message: "Attempted question created successfully",
  });
});

const createAttemptedQuestionsBulk = asyncHandler(async (req, res) => {
  const attemptedQuestions = req.body;
  await attemptedQuestionService.createAttemptedQuestionsBulk(
    attemptedQuestions
  );
  res.status(201).json({
    success: true,
    message: "Attempted questions created successfully",
  });
});

const updateAttemptedQuestion = asyncHandler(async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  const attemptedQuestion =
    await attemptedQuestionService.getAttemptedQuestionById(id);
  if (attemptedQuestion.length < 1) {
    throw new ApiError(404, "Attempted question not found");
  }

  await attemptedQuestionService.updateAttemptedQuestion(id, updates);
  res.json({
    success: true,
    message: "Attempted question updated successfully",
  });
});

const getAttemptedQuestionsByFilters = asyncHandler(async (req, res) => {
  const {
    child_id,
    topic,
    date,
    difficulty,
    set_id,
    page = 1,
    limit = 10,
  } = req.query;
  const filters = { child_id, topic, date, difficulty, set_id };
  const attemptedQuestions =
    await attemptedQuestionService.getAttemptedQuestionsByFilters(
      filters,
      page,
      limit
    );
  res.json({
    success: true,
    data: attemptedQuestions,
  });
});

const deleteAttemptedQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attemptedQuestion =
    await attemptedQuestionService.getAttemptedQuestionById(id);
  if (attemptedQuestion.length < 1) {
    throw new ApiError(404, "Attempted question not found");
  }

  await attemptedQuestionService.deleteAttemptedQuestionById(id);
  res.json({
    success: true,
    message: "Attempted question deleted successfully",
  });
});

const deleteAttemptedQuestionsByChildId = asyncHandler(async (req, res) => {
  const { child_id } = req.params;

  const child = await childrenService.getChildById({ child_id });
  if (child.length < 1) {
    throw new ApiError(404, "Child not found");
  }

  await attemptedQuestionService.deleteAttemptedQuestionsByChildId(child_id);
  res.json({
    success: true,
    message: "All attempted questions for the child deleted successfully",
  });
});

module.exports = {
  createAttemptedQuestion,
  createAttemptedQuestionsBulk,
  updateAttemptedQuestion,
  getAttemptedQuestionsByFilters,
  deleteAttemptedQuestionById,
  deleteAttemptedQuestionsByChildId,
};

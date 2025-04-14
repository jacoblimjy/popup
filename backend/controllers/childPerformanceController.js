const childPerformanceService = require("../services/childPerformanceService");
const childrenService = require("../services/childrenService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const getChildPerformanceByFilters = asyncHandler(async (req, res) => {
  const { child_id, topic_id, difficulty_id } = req.query;
  if (!child_id) {
    throw new ApiError(400, "child_id is required");
  }
  // Call ChildService to check if child exists
  const child = await childrenService.getChildById(child_id);
  if (!child) {
    throw new ApiError(404, "Child not found");
  }
  let performances;
  if (topic_id) {
    if (difficulty_id) {
      performances =
        await childPerformanceService.getChildPerformanceByChildIdTopicIdAndDifficultyLevel(
          child_id,
          topic_id,
          difficulty_id
        );
    } else {
      performances =
        await childPerformanceService.getChildPerformanceByChildIdAndTopicId(
          child_id,
          topic_id
        );
    }
  } else {
    performances = await childPerformanceService.getChildPerformanceByChildId(
      child_id
    );
  }
  res.json({
    success: true,
    data: performances,
  });
});

const getOverallChildPerformance = asyncHandler(async (req, res) => {
  const { child_id } = req.params;
  if (!child_id) {
    throw new ApiError(400, "child_id is required");
  }
  const child = await childrenService.getChildById(child_id);
  if (!child) {
    throw new ApiError(404, "Child not found");
  }
  const performance = await childPerformanceService.getOverallChildPerformance(
    child_id
  );
  if (!performance) {
    return res.json({
      success: true,
      data: {
        child_id: parseInt(child_id),
        total_questions_completed: 0,
        overall_score: 0,
        average_time_per_question: 0,
      },
    });
  }
  res.json({
    success: true,
    data: performance,
  });
});

const getChildPerformanceRecommendation = asyncHandler(async (req, res) => {
  const { child_id } = req.params;
  if (!child_id) {
    throw new ApiError(400, "child_id is required");
  }
  const child = await childrenService.getChildById(child_id);
  if (!child) {
    throw new ApiError(404, "Child not found");
  }
  const recommendation =
    await childPerformanceService.getChildPerformanceRecommendation(child_id);
  if (!recommendation) {
    return res.json({
      success: true,
      data: {},
    });
  }
  res.json({
    success: true,
    data: recommendation,
  });
});

const deleteChildPerformanceByUpId = asyncHandler(async (req, res) => {
  const { up_id } = req.params;
  await childPerformanceService.deleteChildPerformanceByUpId(up_id);
  res.json({
    success: true,
    message: "Child performance deleted successfully",
  });
});

const deleteChildPerformanceByChildId = asyncHandler(async (req, res) => {
  const { child_id } = req.params;
  const child = await childrenService.getChildById(child_id);
  if (!child) {
    throw new ApiError(404, "Child not found");
  }
  await childPerformanceService.deleteChildPerformanceByChildId(child_id);
  res.json({
    success: true,
    message: "Child performance deleted successfully",
  });
});

module.exports = {
  getChildPerformanceByFilters,
  getChildPerformanceRecommendation,
  getOverallChildPerformance,
  deleteChildPerformanceByUpId,
  deleteChildPerformanceByChildId,
};
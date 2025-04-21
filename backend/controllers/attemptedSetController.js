const attemptedSetService = require("../services/attemptedSetService");
const childrenService = require("../services/childrenService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const createAttemptedSet = asyncHandler(async (req, res) => {
  const attemptedSet = req.body;
  const set_id = await attemptedSetService.createAttemptedSet(attemptedSet);
  res.status(201).json({
    success: true,
    set_id,
    message: "Attempted set created successfully",
  });
});

const updateAttemptedSet = asyncHandler(async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  const attemptedSet = await attemptedSetService.getAttemptedSetById(id);

  if (!attemptedSet || attemptedSet.length < 1) {
    throw new ApiError(404, "Attempted set not found");
  }

  await attemptedSetService.updateAttemptedSet(id, updates);
  res.json({
    success: true,
    message: "Attempted set updated successfully",
  });
});

const getAttemptedSetsByFilters = asyncHandler(async (req, res) => {
  const { child_id, topic_id, set_id, difficulty_id } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filters = { child_id, topic_id, set_id, difficulty_id };

  Object.keys(filters).forEach((key) => {
    if (!filters[key]) delete filters[key];
  });

  const attemptedSets = await attemptedSetService.getAttemptedSetsByFilters(
    filters,
    page,
    limit
  );
  res.status(200).json({
    success: true,
    data: attemptedSets,
  });
});

const getAttemptedSetBySetId = asyncHandler(async (req, res) => {
  const { set_id } = req.params;
  const attemptedSet = await attemptedSetService.getAttemptedSetById(set_id);

  if (!attemptedSet) {
    throw new ApiError(404, "Attempted set not found");
  }

  res.status(200).json({
    success: true,
    data: attemptedSet,
  });
});

const deleteAttemptedSetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attemptedSet = await attemptedSetService.getAttemptedSetById(id);

  if (!attemptedSet || attemptedSet.length < 1) {
    throw new ApiError(404, "Attempted set not found");
  }

  await attemptedSetService.deleteAttemptedSetById(id);
  res.json({
    success: true,
    message: "Attempted set deleted successfully",
  });
});

const deleteAttemptedSetsByChildId = asyncHandler(async (req, res) => {
  const { child_id } = req.params;

  const child = await childrenService.getChildById(child_id);
  if (!child || child.length < 1) {
    throw new ApiError(404, "Child not found");
  }

  await attemptedSetService.deleteAttemptedSetsByChildId(child_id);
  res.json({
    success: true,
    message: "All attempted sets for the child deleted successfully",
  });
});

module.exports = {
  createAttemptedSet,
  updateAttemptedSet,
  getAttemptedSetsByFilters,
  getAttemptedSetBySetId,
  deleteAttemptedSetById,
  deleteAttemptedSetsByChildId,
};

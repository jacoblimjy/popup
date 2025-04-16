const childrenService = require("../services/childrenService");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const createChild = asyncHandler(async (req, res) => {
  // TODO: Check if theres bad request if education_level is missing
  const { userId, child_name, age, education_level } = req.body;

  if (!userId || !child_name || !age) {
    throw new ApiError(400, "userId, child_name, and age are required");
  }

  const childId = await childrenService.createChild(
    userId,
    child_name,
    age,
    education_level
  );
  res.status(201).json({
    success: true,
    childId,
    message: "Child created successfully",
  });
});

const createChildrenBatch = asyncHandler(async (req, res) => {
  const { userId, children } = req.body;

  if (
    !userId ||
    !children ||
    !Array.isArray(children) ||
    children.length === 0
  ) {
    throw new ApiError(400, "userId and non-empty children array are required");
  }

  const createdChildren = await childrenService.createChildrenBatch(
    userId,
    children
  );
  res.status(201).json({
    success: true,
    createdChildren,
    message: "Children created successfully",
  });
});

// TODO: Make it such that you dont need all the fields to update
// Either that or we just update all fields in the frontend
const updateChild = asyncHandler(async (req, res) => {
  const { child_name, age, education_level } = req.body;
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Child ID is required");
  }

  if (!child_name || !age || education_level === undefined) {
    throw new ApiError(
      400,
      "child_name, age, and education_level are required"
    );
  }

  await childrenService.updateChild(id, child_name, age, education_level);
  res.json({
    success: true,
    message: "Child updated successfully",
  });
});

const getChildById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Child ID is required");
  }

  const child = await childrenService.getChildById(id);
  res.json({
    success: true,
    data: child,
  });
});

const getChildrenByUserId = asyncHandler(async (req, res) => {
  const { user_id, page = 1, limit = 10 } = req.query;

  if (!user_id) {
    throw new ApiError(400, "user_id is required");
  }

  const offset = (page - 1) * limit;
  if (isNaN(limit) || isNaN(offset)) {
    throw new ApiError(400, "Invalid limit or offset value");
  }

  const children = await childrenService.getChildrenByUserId(
    parseInt(user_id),
    page,
    limit
  );
  res.json({
    success: true,
    data: children,
  });
});

const deleteChild = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Child ID is required");
  }

  await childrenService.deleteChild(id);
  res.json({
    success: true,
    message: "Child deleted successfully",
  });
});

module.exports = {
  createChild,
  createChildrenBatch,
  updateChild,
  getChildById,
  getChildrenByUserId,
  deleteChild,
};

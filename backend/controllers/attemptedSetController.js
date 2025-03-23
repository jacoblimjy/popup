const attemptedSetService = require("../services/attemptedSetService");
const childrenService = require("../services/childrenService");

const createAttemptedSet = async (req, res) => {
  try {
    const attemptedSet = req.body;
    const set_id = await attemptedSetService.createAttemptedSet(attemptedSet);
    res.status(201).json({
      set_id,
      message: "Attempted set created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAttemptedSet = async (req, res) => {
  try {

    const updates = req.body;
    const { id } = req.params;

    const attemptedSet = await attemptedSetService.getAttemptedSetById(req.params.id);

    // TODO: Check if exists, return 404 if not
    if (attemptedSet.length < 1) {
      return res.status(404).json({
        message: "Attempted set not found",
      });
    }

    await attemptedSetService.updateAttemptedSet(id, updates);
    res.json({
      message: "Attempted set updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAttemptedSetsByFilters = async (req, res) => {
  try {
    const { child_id, topic_id, set_id, difficulty_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = { child_id, topic_id, set_id, difficulty_id };

    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    const attemptedSets = await attemptedSetService.getAttemptedSetsByFilters(filters, page, limit);
    res.status(200).json(attemptedSets);

  } catch (error) {
    console.error("Error fetching attempted sets with questions:", error.message);
    res.status(500).json({ message: "Failed to fetch attempted sets with questions" });
  }
};

const deleteAttemptedSetById = async (req, res) => {
  try {

    const { id } = req.params;

    const attemptedSet = await attemptedSetService.getAttemptedSetById(req.params.id);

    // TODO: Check if exists, return 404 if not
    if (attemptedSet.length < 1) {
        return res.status(404).json({
          message: "Attempted set not found",
        });
    }

    await attemptedSetService.deleteAttemptedSetById(id);
    res.json({
      message: "Attempted set deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAttemptedSetsByChildId = async (req, res) => {
  try {
    const { child_id } = req.params;

    // Check if Child exists, return 404 if not
    const child = await childrenService.getChildById(child_id);
    if (child.length < 1) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    await attemptedSetService.deleteAttemptedSetsByChildId(child_id);
    res.json({
      message: "All attempted sets for the child deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAttemptedSet,
  updateAttemptedSet,
  getAttemptedSetsByFilters,
  deleteAttemptedSetById,
  deleteAttemptedSetsByChildId,
};
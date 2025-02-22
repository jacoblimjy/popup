const childPerformanceService = require("../services/childPerformanceService");

const createChildPerformance = async (req, res) => {
  try {
    const childPerformance = req.body;
    const up_id = await childPerformanceService.createChildPerformance(childPerformance);
    res.status(201).json({
      up_id,
      message: "Child performance created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateChildPerformance = async (req, res) => {
  try {
    const updates = req.body;
    const { up_id } = req.params;
    await childPerformanceService.updateChildPerformance(up_id, updates);
    res.json({
      message: "Child performance updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getChildPerformanceByChildId = async (req, res) => {
  try {
    const { child_id } = req.params;
    const performances = await childPerformanceService.getChildPerformanceByChildId(child_id);
    res.json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteChildPerformance = async (req, res) => {
  try {
    const { up_id } = req.params;
    await childPerformanceService.deleteChildPerformance(up_id);
    res.json({
      message: "Child performance deleted successfully",
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
  createChildPerformance,
  updateChildPerformance,
  getChildPerformanceByChildId,
  deleteChildPerformance,
};
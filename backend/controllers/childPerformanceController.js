const childPerformanceService = require("../services/childPerformanceService");


const createChildPerformance = async (req, res) => {
  try {
    const childPerformance = req.body;

    // Call ChildService to check if child exists
    // const child = await childService.getChildById(child_id);
    // if (!child) {
    //   throw new Error("Child does not exist");
    // }

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

    // Call ChildService to check if child exists
    // const child = await childService.getChildById(child_id);
    // if (!child) {
    //   throw new Error("Child does not exist");
    // }
    
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


const getChildPerformanceByChildIdAndTopicId = async (req, res) => {
  try {
    const { child_id, topic_id } = req.query;

    // Call ChildService to check if child exists
    // const child = await childService.getChildById(child_id);
    // if (!child) {
    //   throw new Error("Child does not exist");
    // }

    const performances = await childPerformanceService.getChildPerformanceByChildIdAndTopicId(child_id, topic_id);
    res.json(performances);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteChildPerformanceByUpId = async (req, res) => {
  try {
    const { up_id } = req.params;

    await childPerformanceService.deleteChildPerformanceByUpId(up_id);
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

const deleteChildPerformanceByChildId = async (req, res) => {
  try {
    // Check if Child exists
    // const child = await childService.getChildById(child_id);
    // if (!child) {
    //   throw new Error("Child does not exist");
    // }

    const { child_id } = req.params;
    await childPerformanceService.deleteChildPerformanceByChildId(child_id);
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
}

module.exports = {
  createChildPerformance,
  updateChildPerformance,
  getChildPerformanceByChildIdAndTopicId,
  deleteChildPerformanceByUpId,
  deleteChildPerformanceByChildId,
};
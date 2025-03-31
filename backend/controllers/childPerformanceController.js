const childPerformanceService = require("../services/childPerformanceService");
const childrenService = require("../services/childrenService");

const getChildPerformanceByFilters = async (req, res) => {
  try {
    const { child_id, topic_id, difficulty_id } = req.query;

    if (!child_id || !topic_id) {
      return res.status(400).json({
        message: "child_id and topic_id are required",
      });
    }

    // Call ChildService to check if child exists
    const child = await childrenService.getChildById(child_id);
    if (!child) {
      return res.status(404).json({
        message: "Child not found",
      });
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
      performances = await childPerformanceService.getOverallChildPerformance(
        child_id
      );
    }

    res.json({
      success: true,
      data: performances,
    });
  } catch (error) {
    console.error("Error fetching child performance: ", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getOverallChildPerformance = async (req, res) => {
  try {
    const { child_id } = req.params;

    if (!child_id) {
      return res.status(400).json({
        message: "child_id is required",
      });
    }

    const child = await childrenService.getChildById(child_id);
    if (!child) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

    const performance =
      await childPerformanceService.getOverallChildPerformance(child_id);

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
  } catch (error) {
    console.error("Error fetching child overall performance: ", error);
    res.status(500).json({
      success: false,
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
    const { child_id } = req.params;

    const child = await childrenService.getChildById(child_id);
    if (!child) {
      return res.status(404).json({
        message: "Child not found",
      });
    }

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
};

module.exports = {
  getChildPerformanceByFilters,
  getOverallChildPerformance,
  deleteChildPerformanceByUpId,
  deleteChildPerformanceByChildId,
};

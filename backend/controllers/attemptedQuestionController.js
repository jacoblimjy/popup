const attemptedQuestionService = require("../services/attemptedQuestionService");
const childrenService = require("../services/childrenService");

const createAttemptedQuestion = async (req, res) => {
  try {
    const attemptedQuestion = req.body;
    const aq_id = await attemptedQuestionService.createAttemptedQuestion(attemptedQuestion);
    res.status(201).json({
      aq_id,
      message: "Attempted question created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const createAttemptedQuestionsBulk = async (req, res) => {
  try {
    const attemptedQuestions = req.body;
    await attemptedQuestionService.createAttemptedQuestionsBulk(attemptedQuestions);
    res.status(201).json({
      message: "Attempted questions created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAttemptedQuestion = async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;
    // Check if the attempted question exists, else return 404
    const attemptedQuestion = await attemptedQuestionService.getAttemptedQuestionById(id);
    if (attemptedQuestion.length < 1) {
      return res.status(404).json({
        message: "Attempted question not found",
      });
    }

    await attemptedQuestionService.updateAttemptedQuestion(id, updates);
    res.json({
      message: "Attempted question updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAttemptedQuestionsByFilters = async (req, res) => {
  try {
    const { child_id, topic, date, difficulty, set_id, page = 1, limit = 10 } = req.query;
    const filters = { child_id, topic, date, difficulty, set_id };
    const attemptedQuestions = await attemptedQuestionService.getAttemptedQuestionsByFilters(filters, page, limit);
    res.json(attemptedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAttemptedQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the attempted question exists, else return 404
    const attemptedQuestion = await attemptedQuestionService.getAttemptedQuestionById(id);
    if (attemptedQuestion.length < 1) {
      return res.status(404).json({
        message: "Attempted question not found",
      });
    }
    await attemptedQuestionService.deleteAttemptedQuestionById(id);
    res.json({
      message: "Attempted question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAttemptedQuestionsByChildId = async (req, res) => {
  try {
    const { child_id } = req.params;
    // Check if the child has attempted questions, else return 404
    const child = await childrenService.getChildById({ child_id });
    if (child.length < 1) {
      return res.status(404).json({
        message: "Child not found",
      });
    }
    
    await attemptedQuestionService.deleteAttemptedQuestionsByChildId(child_id);
    res.json({
      message: "All attempted questions for the child deleted successfully",
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
  createAttemptedQuestion,
  createAttemptedQuestionsBulk,
  updateAttemptedQuestion,
  getAttemptedQuestionsByFilters,
  deleteAttemptedQuestionById,
  deleteAttemptedQuestionsByChildId,
};
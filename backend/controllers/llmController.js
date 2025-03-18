const llmService = require("../services/llmService");

const generateQuestions = async (req, res) => {
  try {
    const { topic_id, difficulty_id, num_questions } = req.body;

    if (!topic_id || !difficulty_id || !num_questions) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const result = await llmService.generateQuestions(topic_id, difficulty_id, num_questions);

    res.status(200).json({
      message: "Questions generated successfully",
      result,
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
  generateQuestions,
};
const llmService = require("../services/llmService");

/**
 * Generate questions based on topic, difficulty and count
 *
 * @route POST /api/llm/questions/generate
 * @access Protected
 */
const generateQuestions = async (req, res) => {
  try {
    const { question_type, difficulty_level, num_questions } = req.body;

    if (!question_type || !difficulty_level || !num_questions) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters. Please provide question_type, difficulty_level, and num_questions.",
      });
    }

    const parsedNumQuestions = parseInt(num_questions);
    if (
      isNaN(parsedNumQuestions) ||
      parsedNumQuestions < 1 ||
      parsedNumQuestions > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "num_questions must be a number between 1 and 20",
      });
    }

    const topicData = await llmService.getTopicByName(question_type);
    const difficultyData = await llmService.getDifficultyByLabel(
      difficulty_level
    );

    if (!topicData) {
      const [availableTopics] = await req.app.locals.db.execute(
        "SELECT topic_name FROM Topics"
      );
      const topicList = availableTopics
        .map((t) => `'${t.topic_name}'`)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: `Invalid question_type: '${question_type}'. Available types: ${topicList}`,
      });
    }

    if (!difficultyData) {
      const [availableDifficulties] = await req.app.locals.db.execute(
        "SELECT label FROM Difficulty_Levels"
      );
      const difficultyList = availableDifficulties
        .map((d) => `'${d.label}'`)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: `Invalid difficulty_level: '${difficulty_level}'. Available levels: ${difficultyList}`,
      });
    }

    const result = await llmService.generateQuestions(
      topicData.topic_id,
      difficultyData.difficulty_id,
      parsedNumQuestions
    );

    return res.status(200).json({
      success: true,
      message: "Questions generated and added to pending review queue",
      data: {
        total_requested: parsedNumQuestions,
        total_generated: result.successCount,
        failed: result.failureCount,
        questions: result.successful.map((item) => ({
          id: item.pendingQuestionId,
          question_type,
          difficulty_level,
          status: "pending_review",
        })),
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

module.exports = {
  generateQuestions,
};

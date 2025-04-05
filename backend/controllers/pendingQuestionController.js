const pendingQuestionService = require("../services/pendingQuestionService");

const createPendingQuestion = async (req, res) => {
	try {
		// Validate required fields
		const requiredFields = [
			"question_text",
			"answer_format", // 👈 Ensure this is required
			"correct_answer",
			"distractors",
			"topic_id",
			"difficulty_id",
			"explanation",
		];

		const missingFields = requiredFields.filter((field) => !req.body[field]);
		if (missingFields.length > 0) {
			return res.status(400).json({
				message: "Missing required fields",
				missingFields,
			});
		}

		const pendingQuestionId =
			await pendingQuestionService.createPendingQuestion(req.body);
		res.status(201).json({
			pendingQuestionId,
			message: "Pending Question created successfully",
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create pending question",
			error: error.message,
		});
	}
};

const createPendingQuestionsBulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body.questions)) {
      return res
        .status(400)
        .json({ message: "Pending Questions must be provided as an array" });
    }

    const result = await pendingQuestionService.createPendingQuestionsBulk(
      req.body.questions
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: "Failed to process pending questions",
      error: error.message,
    });
  }
};

const convertPendingQuestionToQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid pending question ID" });
    }

    const questionId = await pendingQuestionService.convertPendingQuestionToQuestion(id);
    
    res.json({
      questionId,
      message: "Pending question converted to approved question successfully",
    });
  } catch (error) {
    if (error.message === "Pending Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to convert pending question to approved question",
        error: error.message,
      });
    }
  }
};

const getPendingQuestions = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit) || 200));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);

    const filters = {};

    if (req.query.topic_id && !isNaN(parseInt(req.query.topic_id))) {
      filters.topic_id = parseInt(req.query.topic_id);
    }

    if (req.query.difficulty_id && !isNaN(parseInt(req.query.difficulty_id))) {
      filters.difficulty_id = parseInt(req.query.difficulty_id);
    }

    const pendingQuestions = await pendingQuestionService.getPendingQuestions(
      filters,
      limit,
      offset
    );
    res.json(pendingQuestions);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch pending questions",
      error: error.message,
    });
  }
};

const getPendingQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid pending question ID" });
    }

    const pendingQuestion = await pendingQuestionService.getPendingQuestionById(parseInt(id));
    res.json(pendingQuestion);
  } catch (error) {
    if (error.message === "Pending Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to fetch pending question",
        error: error.message,
      });
    }
  }
};

const updatePendingQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid pending question ID" });
    }

    const requiredFields = [
      "question_text",
      "answer_format",
      "correct_answer",
      "distractors",
      "topic_id",
      "difficulty_id",
      "explanation"
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    await pendingQuestionService.updatePendingQuestion(parseInt(id), req.body);
    const updatedPendingQuestion = await pendingQuestionService.getPendingQuestionById(parseInt(id));
    res.json({
      message: "Pending Question updated successfully",
      question: updatedPendingQuestion,
    });
  } catch (error) {
    if (error.message === "Pending Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to update pending question",
        error: error.message,
      });
    }
  }
};

const deletePendingQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid pending question ID" });
    }

    await pendingQuestionService.deletePendingQuestion(parseInt(id));
    res.json({ message: "Pending Question deleted successfully" });
  } catch (error) {
    if (error.message === "Pending Question not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({
        message: "Failed to delete pending question",
        error: error.message,
      });
    }
  }
};

module.exports = {
  createPendingQuestion,
  createPendingQuestionsBulk,
  convertPendingQuestionToQuestion,
  getPendingQuestions,
  getPendingQuestionById,
  updatePendingQuestion,
  deletePendingQuestion,
};

const llmService = require("../services/llmService");

/**
 * Generate multiple questions from a list of topics.
 * @route POST /api/llm/questions/generate
 * @access Protected
 */
const generateQuestions = async (req, res) => {
	try {
		const { question_types, difficulty_level, num_questions } = req.body;

		if (
			!question_types ||
			!Array.isArray(question_types) ||
			question_types.length === 0 ||
			!difficulty_level ||
			!num_questions
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing or invalid parameters. Please provide question_types (array), difficulty_level, and num_questions.",
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

		const difficultyData = await llmService.getDifficultyByLabel(
			difficulty_level
		);
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

		const results = [];
		for (const question_type of question_types) {
			const topicData = await llmService.getTopicByName(question_type);

			if (!topicData) {
				results.push({
					question_type,
					success: false,
					error: `Invalid question_type: '${question_type}'`,
				});
				continue;
			}

			const result = await llmService.generateQuestions(
				topicData.topic_id,
				difficultyData.difficulty_id,
				parsedNumQuestions
			);

			results.push({
				question_type,
				success: true,
				total_generated: result.successCount,
				failed: result.failureCount,
				questions: result.successful.map((item) => ({
					id: item.pendingQuestionId,
					difficulty_level,
					status: "pending_review",
				})),
			});
		}

		return res.status(200).json({
			success: true,
			message: "Questions generated for selected topics",
			results,
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

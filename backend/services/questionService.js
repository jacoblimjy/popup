const db = require("../db");


const createQuestion = async (question) => {
	try {
		const {
			question_text,
			answer_format,
			correct_answer,
			distractors,
			topic_id,
			difficulty_id,
			explanation,
			is_llm_generated = false,
		} = question;

		const distractorsJson = Array.isArray(distractors)
			? JSON.stringify(distractors)
			: JSON.stringify([distractors]);

		const [result] = await db.execute(
			`INSERT INTO Questions (
        question_text,
        answer_format,
        correct_answer,
        distractors,
        topic_id,
        difficulty_id,
        explanation,
        is_llm_generated,
        date_created,
        last_modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
			[
				question_text,
				answer_format,
				correct_answer,
				distractorsJson,
				topic_id,
				difficulty_id,
				explanation,
				is_llm_generated,
			]
		);

		return result.insertId;
	} catch (error) {
		throw error;
	}
};

const createQuestionsBulk = async (questions) => {
  const createdQuestions = [];
  const errors = [];

  for (let i = 0; i < questions.length; i++) {
    try {
      const questionId = await createQuestion(questions[i]);
      createdQuestions.push({
        index: i,
        questionId,
        status: "success",
      });
    } catch (error) {
      errors.push({
        index: i,
        question: questions[i],
        error: error.message,
      });
    }
  }

  return {
    successful: createdQuestions,
    failed: errors,
    totalProcessed: questions.length,
    successCount: createdQuestions.length,
    failureCount: errors.length,
  };
};

// Parsing is not required because the distractors are already in Object type when retrieved from db
// const parseDistractors = (distractor) => {
//   if (!distractor) return [];
//   try {
//     return JSON.parse(distractor);
//   } catch (error) {
//     return [];
//   }
// };

const getQuestions = async (filters = {}, limit = 10, offset = 0) => {
  try {
    const { topic_id, difficulty_id } = filters;
    let query = "SELECT * FROM Questions";
    const whereConditions = [];
    const params = [];

    if (topic_id) {
      whereConditions.push("topic_id = ?");
      params.push(topic_id);
    }

    if (difficulty_id) {
      whereConditions.push("difficulty_id = ?");
      params.push(difficulty_id);
    }

    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }

    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [questions] = await db.execute(query, params);

    return questions;
  } catch (error) {
    throw error;
  }
};

const getRedoQuestions = async (setId) => {
  try {
    // Fetch questions directly by joining Attempted_Questions and Questions tables
    const [questions] = await db.execute(
      `SELECT q.* 
        FROM Questions q
        INNER JOIN Attempted_Questions aq ON q.question_id = aq.question_id
        WHERE aq.set_id = ?`,
      [setId]
    );

    if (questions.length === 0) {
      throw new Error("No questions found for the provided set ID");
    }

    return questions;
  } catch (error) {
    throw error;
  }
};

const getQuestionById = async (questionId) => {
  try {
    const [questions] = await db.execute(
      "SELECT * FROM Questions WHERE question_id = ?",
      [questionId]
    );

    if (questions.length === 0) {
      throw new Error("Question not found");
    }

    const question = questions[0];
    return question;
  } catch (error) {
    throw error;
  }
};

const updateQuestion = async (questionId, questionData) => {
  try {
    const [existingQuestion] = await db.execute(
      "SELECT question_id FROM Questions WHERE question_id = ?",
      [questionId]
    );

    if (existingQuestion.length === 0) {
      throw new Error("Question not found");
    }

    const {
      question_text,
      answer_format,
      correct_answer,
      distractors,
      topic_id,
      difficulty_id,
      explanation,
      is_llm_generated,
    } = questionData;

    const distractorsJson = Array.isArray(distractors)
      ? JSON.stringify(distractors)
      : JSON.stringify([distractors]);

    const [result] = await db.execute(
      `UPDATE Questions SET 
        question_text = ?,
        answer_format = ?,
        correct_answer = ?,
        distractors = ?,
        topic_id = ?,
        difficulty_id = ?,
        explanation,
        is_llm_generated = ?,
        last_modified = NOW()
      WHERE question_id = ?`,
      [
        question_text,
        answer_format,
        correct_answer,
        distractorsJson,
        topic_id,
        difficulty_id,
        explanation,
        is_llm_generated,
        questionId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update question");
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const deleteQuestion = async (questionId) => {
  try {
    const [existingQuestion] = await db.execute(
      "SELECT question_id FROM Questions WHERE question_id = ?",
      [questionId]
    );

    if (existingQuestion.length === 0) {
      throw new Error("Question not found");
    }

    await db.execute("DELETE FROM Questions WHERE question_id = ?", [
      questionId,
    ]);

    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createQuestion,
  createQuestionsBulk,
  getQuestions,
  getRedoQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

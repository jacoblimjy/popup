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
  try {
    if (questions.length === 0) {
      return {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
      };
    }

    const placeholders = [];
    const values = [];
    const questionIndexMap = new Map();

    questions.forEach((question, index) => {
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

      placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
      values.push(
        question_text,
        answer_format,
        correct_answer,
        distractorsJson,
        topic_id,
        difficulty_id,
        explanation,
        is_llm_generated
      );

      questionIndexMap.set(values.length / 8 - 1, index);
    });

    // Execute bulk insert
    const query = `
      INSERT INTO Questions (
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
      ) VALUES ${placeholders.join(", ")}
    `;

    const [result] = await db.execute(query, values);

    const successful = [];
    const insertId = result.insertId;

    for (let i = 0; i < result.affectedRows; i++) {
      const originalIndex = questionIndexMap.get(i);
      successful.push({
        index: originalIndex,
        questionId: insertId + i,
        status: "success",
      });
    }

    return {
      successful,
      failed: [],
      totalProcessed: questions.length,
      successCount: successful.length,
      failureCount: 0,
    };
  } catch (error) {
    console.error(
      "Bulk insert failed, falling back to individual inserts:",
      error.message
    );

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
  }
};

const getQuestions = async (filters = {}, limit = 10, offset = 0) => {
  try {
    const {
      topic_id,
      difficulty_id,
      child_id,
      exclude_seen,
      recycle = true,
    } = filters;

    // First, try to get unseen questions
    if (child_id && exclude_seen) {
      let unseenQuery = `
        SELECT q.* FROM Questions q
        WHERE NOT EXISTS (
          SELECT 1 FROM Attempted_Questions aq
          WHERE aq.question_id = q.question_id
          AND aq.child_id = ?
        )
      `;
      const params = [child_id];

      // Add additional filter conditions
      const whereConditions = [];

      if (topic_id) {
        whereConditions.push("q.topic_id = ?");
        params.push(topic_id);
      }

      if (difficulty_id) {
        whereConditions.push("q.difficulty_id = ?");
        params.push(difficulty_id);
      }

      if (whereConditions.length > 0) {
        unseenQuery += " AND " + whereConditions.join(" AND ");
      }

      // Add limit and offset
      unseenQuery += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

      // Execute the query for unseen questions
      const [unseenQuestions] = await db.execute(unseenQuery, params);

      // If we found enough unseen questions, return them
      if (unseenQuestions.length > 0) {
        return unseenQuestions;
      }

      // If recycle is false, return empty array when no unseen questions are found
      if (!recycle) {
        return [];
      }
    }

    // If we need to recycle questions or not filtering by seen status,
    // execute a query to get any questions based on filters
    let query = "SELECT q.* FROM Questions q";
    const params = [];
    const whereConditions = [];

    if (topic_id) {
      whereConditions.push("q.topic_id = ?");
      params.push(topic_id);
    }

    if (difficulty_id) {
      whereConditions.push("q.difficulty_id = ?");
      params.push(difficulty_id);
    }

    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }

    // If child_id is provided, sort by least recently attempted
    if (child_id) {
      query += `
        ${whereConditions.length > 0 ? " AND" : " WHERE"} q.question_id IN (
          SELECT question_id FROM Questions
        )
        ORDER BY (
          SELECT MAX(attempt_timestamp) 
          FROM Attempted_Questions 
          WHERE question_id = q.question_id 
          AND child_id = ?
        ) ASC NULLS FIRST
      `;
      params.push(child_id);
    }

    // Add limit and offset
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [questions] = await db.execute(query, params);
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
        explanation = ?,
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
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

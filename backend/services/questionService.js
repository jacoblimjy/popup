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
        is_llm_generated,
        date_created,
        last_modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        question_text,
        answer_format,
        correct_answer,
        distractorsJson,
        topic_id,
        difficulty_id,
        is_llm_generated,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

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

    return questions.map((question) => {
      let parsedDistractors = [];
      try {
        const cleanJson = question.distractors.replace(/^\uFEFF/, "");
        parsedDistractors = JSON.parse(cleanJson);
      } catch (error) {
        console.error(
          `Failed to parse distractors for question ${question.question_id}:`,
          error
        );
        parsedDistractors = question.distractors || [];
      }

      return {
        ...question,
        distractors: parsedDistractors,
      };
    });
  } catch (error) {
    console.error("Database error:", error);
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

    try {
      const cleanJson = question.distractors.replace(/^\uFEFF/, "");
      question.distractors = JSON.parse(cleanJson);
    } catch (error) {
      console.error(
        `Failed to parse distractors for question ${question.question_id}:`,
        error
      );
      question.distractors = question.distractors || [];
    }

    return question;
  } catch (error) {
    console.error("Database error:", error);
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
        is_llm_generated,
        questionId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update question");
    }

    return true;
  } catch (error) {
    console.error("Database error:", error);
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
    console.error("Database error:", error);
    throw error;
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

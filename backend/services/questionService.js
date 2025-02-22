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

module.exports = {
  createQuestion,
  getQuestions,
};

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
        JSON.stringify(distractors),
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

module.exports = {
  createQuestion,
};

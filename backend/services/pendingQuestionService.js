const db = require("../db");
const questionService = require("./questionService");

const createPendingQuestion = async (question) => {
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
      `INSERT INTO Pending_Questions (
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

const createPendingQuestionsBulk = async (questions) => {
  const createdPendingQuestions = [];
  const errors = [];

  for (let i = 0; i < questions.length; i++) {
    try {
      const pendingQuestionId = await createPendingQuestion(questions[i]);
      createdPendingQuestions.push({
        index: i,
        pendingQuestionId,
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
    successful: createdPendingQuestions,
    failed: errors,
    totalProcessed: questions.length,
    successCount: createdPendingQuestions.length,
    failureCount: errors.length,
  };
};

const convertPendingQuestionToQuestion = async (pendingQuestionId) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM Pending_Questions WHERE pending_question_id = ?",
      [pendingQuestionId]
    );

    if (result.length === 0) {
      throw new Error("Pending Question not found");
    }
    const existingPendingQuestion = result[0];
    // Create a new question using the questionService
    const questionData = {
      question_text: existingPendingQuestion.question_text,
      answer_format: existingPendingQuestion.answer_format,
      correct_answer: existingPendingQuestion.correct_answer,
      distractors: existingPendingQuestion.distractors,
      topic_id: existingPendingQuestion.topic_id,
      difficulty_id: existingPendingQuestion.difficulty_id,
      explanation: existingPendingQuestion.explanation,
      is_llm_generated: existingPendingQuestion.is_llm_generated,
    };

    const questionId = await questionService.createQuestion(questionData);

    // Delete the pending question
    await deletePendingQuestion(pendingQuestionId);

    return questionId;
  } catch (error) {
    throw error;
  }
};

// Parsing is not required because it is already type Object when retrieved from db
// const parseDistractors = (distractor) => {
//   if (!distractor) return [];
//   try {
//     return JSON.parse(distractor);
//   } catch (error) {
//     return [];
//   }
// };

const getPendingQuestions = async (filters = {}, limit = 10, offset = 0) => {
  try {
    const { topic_id, difficulty_id } = filters;
    let query = "SELECT * FROM Pending_Questions";
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

    return questions.map((question) => ({
      ...question,
    }));
  } catch (error) {
    throw error;
  }
};

const getPendingQuestionById = async (pendingQuestionId) => {
  try {
    const [questions] = await db.execute(
      "SELECT * FROM Pending_Questions WHERE pending_question_id = ?",
      [pendingQuestionId]
    );

    if (questions.length === 0) {
      throw new Error("Pending Question not found");
    }

    const question = questions[0];
    return question;
  } catch (error) {
    throw error;
  }
};

// TODO: Change to allow updating of only certain fields
const updatePendingQuestion = async (pendingQuestionId, questionData) => {
  try {
    const [existingPendingQuestion] = await db.execute(
      "SELECT pending_question_id FROM Pending_Questions WHERE pending_question_id = ?",
      [pendingQuestionId]
    );

    if (existingPendingQuestion.length === 0) {
      throw new Error("Pending Question not found");
    }

    const {
      question_text,
      answer_format,
      correct_answer,
      distractors,
      topic_id,
      difficulty_id,
      explanation,
    } = questionData;

    const distractorsJson = Array.isArray(distractors)
      ? JSON.stringify(distractors)
      : JSON.stringify([distractors]);

    const [result] = await db.execute(
      `UPDATE Pending_Questions SET 
        question_text = ?,
        answer_format = ?,
        correct_answer = ?,
        distractors = ?,
        topic_id = ?,
        difficulty_id = ?,
        explanation = ?,
        last_modified = NOW()
      WHERE pending_question_id = ?`,
      [
        question_text,
        answer_format,
        correct_answer,
        distractorsJson,
        topic_id,
        difficulty_id,
        explanation,
        pendingQuestionId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update pending question");
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const deletePendingQuestion = async (pendingQuestionId) => {
  try {
    const [existingPendingQuestion] = await db.execute(
      "SELECT pending_question_id FROM Pending_Questions WHERE pending_question_id = ?",
      [pendingQuestionId]
    );

    if (existingPendingQuestion.length === 0) {
      throw new Error("Pending Question not found");
    }

    await db.execute("DELETE FROM Pending_Questions WHERE pending_question_id = ?", [
      pendingQuestionId,
    ]);

    return true;
  } catch (error) {
    throw error;
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

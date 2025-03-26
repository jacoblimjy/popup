const db = require("../db");

const createAttemptedSet = async (attemptedSet) => {
  const { child_id, topic_id, total_questions, correct_answers, score, time_spent } = attemptedSet;
  const [result] = await db.execute(
    "INSERT INTO Attempted_Sets (child_id, topic_id, total_questions, correct_answers, score, time_spent) VALUES (?, ?, ?, ?, ?, ?)",
    [child_id, topic_id, total_questions, correct_answers, score, time_spent]
  );
  return result.insertId;
};

const updateAttemptedSet = async (set_id, updates) => {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updates);
  values.push(set_id);

  const query = `UPDATE Attempted_Sets SET ${fields} WHERE set_id = ?`;
  await db.execute(query, values);
};

const getAttemptedSetsByFilters = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  // Dynamically build the query based on the filters
  const conditions = Object.keys(filters)
    .map((key) => {
      if (key === "difficulty_id") {
        return `qs.${key} = ?`;
      }
      return `ats.${key} = ?`;
    })
    .join(" AND ");

  const params = Object.values(filters).map((value) => parseInt(value, 10));

  const query = `
    SELECT 
      ats.set_id,
      ats.child_id,
      ats.topic_id,
      ats.total_questions,
      ats.correct_answers,
      ats.score,
      ats.attempt_timestamp,
      ats.time_spent,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'aq_id', aq.aq_id,
          'question_id', aq.question_id,
          'child_answer', aq.child_answer,
          'is_correct', aq.is_correct,
          'attempt_timestamp', aq.attempt_timestamp,
          'time_spent', aq.time_spent,
          'question_text', qs.question_text,
          'correct_answer', qs.correct_answer,
          'distractors', qs.distractors,
          'difficulty_id', qs.difficulty_id,
          'question_topic_id', qs.topic_id,
          'explanation', qs.explanation
        )
      ) AS attempted_questions
    FROM Attempted_Sets ats
    LEFT JOIN Attempted_Questions aq ON ats.set_id = aq.set_id
    LEFT JOIN Questions qs ON aq.question_id = qs.question_id
    ${conditions ? `WHERE ${conditions}` : ""}
    GROUP BY ats.set_id
    ORDER BY ats.attempt_timestamp DESC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  const [rows] = await db.execute(query, params);

  return rows.map(row => ({
    ...row,
    attempted_questions: typeof row.attempted_questions === 'string'
      ? JSON.parse(row.attempted_questions || '[]')
      : row.attempted_questions || [],
  }));
};

// const getAttemptedSetById = async (set_id) => {
//   const query = "SELECT * FROM Attempted_Sets WHERE set_id = ?";
//   const [attemptedSet] = await db.execute(query, [set_id]);
//   return attemptedSet;
// };

const getAttemptedSetById = async (set_id) => {
  const query = `
    SELECT 
      ats.*, 
      aq.aq_id, 
      aq.question_id, 
      aq.child_answer, 
      aq.is_correct, 
      aq.attempt_timestamp as question_attempt_timestamp, 
      aq.time_spent as question_time_spent, 
      qs.question_text,
      qs.correct_answer,
      qs.distractors,
      qs.difficulty_id,
      qs.topic_id as question_topic_id,
      qs.explanation
    FROM Attempted_Sets ats
    LEFT JOIN Attempted_Questions aq ON ats.set_id = aq.set_id
    LEFT JOIN Questions qs ON aq.question_id = qs.question_id
    WHERE ats.set_id = ?
  `;

  const [rows] = await db.execute(query, [set_id]);

  const groupedResults = rows.reduce((acc, row) => {
    if (!acc[row.set_id]) {
      acc[row.set_id] = {
        set_id: row.set_id,
        child_id: row.child_id,
        topic_id: row.topic_id,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        score: row.score,
        attempt_timestamp: row.attempt_timestamp,
        time_spent: row.time_spent,
        attempted_questions: [],
      };
    }

    if (row.aq_id) {
      acc[row.set_id].attempted_questions.push({
        aq_id: row.aq_id,
        question_id: row.question_id,
        questions_text: row.question_text,
        difficulty_id: row.difficulty_id,
        correct_answer: row.correct_answer,
        distractors: row.distractors,
        child_answer: row.child_answer,
        is_correct: row.is_correct,
        explanation: row.explanation,
        attempt_timestamp: row.question_attempt_timestamp,
        time_spent: row.question_time_spent,
      });
    }

    return acc;
  }, {});

  return Object.values(groupedResults)[0] || null;
};

const deleteAttemptedSetById = async (set_id) => {
  await db.execute("DELETE FROM Attempted_Sets WHERE set_id = ?", [set_id]);
};

const deleteAttemptedSetsByChildId = async (child_id) => {
  await db.execute("DELETE FROM Attempted_Sets WHERE child_id = ?", [child_id]);
};

module.exports = {
  createAttemptedSet,
  updateAttemptedSet,
  getAttemptedSetsByFilters,
  getAttemptedSetById,
  deleteAttemptedSetById,
  deleteAttemptedSetsByChildId,
};
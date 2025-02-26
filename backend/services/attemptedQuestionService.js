const db = require("../db");

const createAttemptedQuestion = async (attemptedQuestion) => {
  const { child_id, set_id, question_id, child_answer, is_correct, time_spent } = attemptedQuestion;
  const [result] = await db.execute(
    "INSERT INTO Attempted_Questions (child_id, set_id, question_id, child_answer, is_correct, attempt_timestamp, time_spent) VALUES (?, ?, ?, ?, ?, NOW(), ?)",
    [child_id, set_id, question_id, child_answer, is_correct, time_spent]
  );
  return result.insertId;
};

const createAttemptedQuestionsBulk = async (attemptedQuestions) => {
  const values = attemptedQuestions.map(q => [q.child_id, q.set_id, q.question_id, q.child_answer, q.is_correct, q.time_spent]);
  const placeholders = values.map(() => "(?, ?, ?, ?, ?, NOW(), ?)").join(", ");
  const flattenedValues = values.flat();
  const query = `INSERT INTO Attempted_Questions (child_id, set_id, question_id, child_answer, is_correct, attempt_timestamp, time_spent) VALUES ${placeholders}`;
  await db.execute(query, flattenedValues);
};

const updateAttemptedQuestion = async (id, updates) => {
  const [attemptedQuestion] = await db.execute("SELECT * FROM Attempted_Questions WHERE aq_id = ?", [id]);
  if (attemptedQuestion.length === 0) {
    throw new Error("Attempted question not found");
  }

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updates);
  values.push(id);

  const query = `UPDATE Attempted_Questions SET ${fields} WHERE aq_id = ?`;
  await db.execute(query, values);
};

const getAttemptedQuestionsByFilters = async (filters, page = 1, limit = 10) => {
  const { child_id, topic, date, difficulty, set_id } = filters;
  const offset = (page - 1) * limit;
  let query = "SELECT * FROM Attempted_Questions WHERE 1=1";
  const params = [];

  if (child_id) {
    query += " AND child_id = ?";
    params.push(child_id);
  }
  if (topic) {
    query += " AND topic_id = ?";
    params.push(topic);
  }
  if (date) {
    query += " AND DATE(attempt_timestamp) = ?";
    params.push(date);
  }
  if (difficulty) {
    query += " AND difficulty_id = ?";
    params.push(difficulty);
  }
  if (set_id) {
    query += " AND set_id = ?";
    params.push(set_id);
  }

  query += `ORDER BY attempt_timestamp DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

  const [attemptedQuestions] = await db.execute(query, params);
  return attemptedQuestions;
};

const getAttemptedQuestionById = async (id) => {
  const query = "SELECT * FROM Attempted_Questions WHERE aq_id = ?";
  const [attemptedQuestion] = await db.execute(query, [id]);
  return attemptedQuestion;
}

const deleteAttemptedQuestionById = async (id) => {
  await db.execute("DELETE FROM Attempted_Questions WHERE aq_id = ?", [id]);
};

const deleteAttemptedQuestionsByChildId = async (child_id) => {
  await db.execute("DELETE FROM Attempted_Questions WHERE child_id = ?", [child_id]);
};

module.exports = {
  createAttemptedQuestion,
  createAttemptedQuestionsBulk,
  updateAttemptedQuestion,
  getAttemptedQuestionsByFilters,
  getAttemptedQuestionById,
  deleteAttemptedQuestionById,
  deleteAttemptedQuestionsByChildId,
};
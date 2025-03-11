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

const getAttemptedSetsByChildId = async (child_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM Attempted_Sets 
    WHERE child_id = ? 
    ORDER BY attempt_timestamp DESC 
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    ;

  const [attemptedSets] = await db.execute(query, [child_id]);
  return attemptedSets;
};

const getAttemptedSetById = async (set_id) => {
  const query = "SELECT * FROM Attempted_Sets WHERE set_id = ?";
  const [attemptedSet] = await db.execute(query, [set_id]);
  return attemptedSet;
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
  getAttemptedSetsByChildId,
  getAttemptedSetById,
  deleteAttemptedSetById,
  deleteAttemptedSetsByChildId,
};
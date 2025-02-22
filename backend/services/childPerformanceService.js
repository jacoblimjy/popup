const db = require("../db");

const createChildPerformance = async (childPerformance) => {
  const { child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery } = childPerformance;
  const [result] = await db.execute(
    "INSERT INTO Child_Performance (child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery, date_recorded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, now())",
    [child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery]
  );
  return result.insertId;
};

const updateChildPerformance = async (up_id, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    values.push(up_id);
  
    const query = `UPDATE Child_Performance SET ${fields} WHERE up_id = ?`;
    await db.execute(query, values);
  };

const getChildPerformanceByChildId = async (child_id) => {
  const [performances] = await db.execute(
    "SELECT * FROM Child_Performance WHERE child_id = ?",
    [child_id]
  );
  return performances;
};

const deleteChildPerformance = async (up_id) => {
  await db.execute("DELETE FROM Child_Performance WHERE up_id = ?", [up_id]);
};

module.exports = {
  createChildPerformance,
  updateChildPerformance,
  getChildPerformanceByChildId,
  deleteChildPerformance,
};
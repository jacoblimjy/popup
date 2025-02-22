const db = require("../db");

const createChildPerformance = async (childPerformance) => {

  // Check if a performance record already exists for the given child_id and topic_id
  const [existingPerformance] = await db.execute(
    "SELECT * FROM Child_Performance WHERE child_id = ? AND topic_id = ?",
    [child_id, topic_id]
  );

  if (existingPerformance.length > 0) {
    throw new Error("A performance record already exists for this child and topic");
  }

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

const getChildPerformanceByChildIdAndTopicId = async (child_id, topic_id = null) => {
  let query = "SELECT * FROM Child_Performance WHERE child_id = ?";
  const params = [child_id];

  if (topic_id !== null) {
    query += " AND topic_id = ?";
    params.push(topic_id);
  }

  const [performances] = await db.execute(query, params);
  return performances;
};

const deleteChildPerformanceByUpId = async (up_id) => {
  await db.execute("DELETE FROM Child_Performance WHERE up_id = ?", [up_id]);
};

const deleteChildPerformanceByChildId = async (child_id) => {
  await db.execute("DELETE FROM Child_Performance WHERE child_id = ?", [child_id]);
};

module.exports = {
  createChildPerformance,
  updateChildPerformance,
  getChildPerformanceByChildId,
  deleteChildPerformance,
};
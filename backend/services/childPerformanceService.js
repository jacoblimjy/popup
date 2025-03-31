const db = require("../db");

const getChildPerformanceByChildIdAndTopicId = async (child_id, topic_id) => {
  const [performances] = await db.execute(
    `
    SELECT
      child_id,
      topic_id,
      SUM(average_time_spent * questions_attempted) AS total_time_spent,
      SUM(questions_attempted) AS total_questions_attempted,
      ROUND(AVG(accuracy_score), 2) AS average_accuracy_score
    FROM Child_Performance
    WHERE child_id = ? AND topic_id = ?
    GROUP BY child_id, topic_id
    `,
    [child_id, topic_id]
  );
  return performances;
};

const getChildPerformanceByChildIdTopicIdAndDifficultyLevel = async (child_id, topic_id, difficulty_id) => {
  let query = "SELECT * FROM Child_Performance WHERE child_id = ? AND topic_id = ? AND difficulty_id = ?";
  const params = [child_id, topic_id, difficulty_id];

  const [performances] = await db.execute(query, params);
  return performances;
};

const deleteChildPerformanceByUpId = async (up_id) => {
  const [existingPerformance] = await db.execute(
    "SELECT * FROM Child_Performance WHERE up_id = ?",
    [up_id]
  );

  if (existingPerformance.length === 0) {
    throw new Error("Performance record not found");
  }
  
  await db.execute("DELETE FROM Child_Performance WHERE up_id = ?", [up_id]);
};

const deleteChildPerformanceByChildId = async (child_id) => {
  await db.execute("DELETE FROM Child_Performance WHERE child_id = ?", [child_id]);
};

module.exports = {
  getChildPerformanceByChildIdAndTopicId,
  getChildPerformanceByChildIdTopicIdAndDifficultyLevel,
  deleteChildPerformanceByUpId,
  deleteChildPerformanceByChildId
};
const db = require("../db");

const getChildPerformanceByChildId = async (child_id) => {
  const [performances] = await db.execute(
    `SELECT
      child_id,
      topic_id,
      SUM(average_time_spent * questions_attempted) AS total_time_spent,
      SUM(questions_attempted) AS total_questions_attempted,
      ROUND(AVG(accuracy_score), 2) AS average_accuracy_score,
      ROUND(SUM(average_time_spent * questions_attempted) / SUM(questions_attempted), 2) AS average_time_per_question
    FROM Child_Performance
    WHERE child_id = ?
    GROUP BY child_id, topic_id`,
    [child_id]
  );
  return performances;
};

const getChildPerformanceByChildIdAndTopicId = async (child_id, topic_id) => {
  const [performances] = await db.execute(
    `
    SELECT
      child_id,
      topic_id,
      SUM(average_time_spent * questions_attempted) AS total_time_spent,
      SUM(questions_attempted) AS total_questions_attempted,
      ROUND(AVG(accuracy_score), 2) AS average_accuracy_score
      ROUND(SUM(average_time_spent * questions_attempted) / SUM(questions_attempted), 2) AS average_time_per_question
    FROM Child_Performance
    WHERE child_id = ? AND topic_id = ?
    GROUP BY child_id, topic_id
    `,
    [child_id, topic_id]
  );
  return performances;
};

const getChildPerformanceByChildIdTopicIdAndDifficultyLevel = async (
  child_id,
  topic_id,
  difficulty_id
) => {
  let query =
    "SELECT * FROM Child_Performance WHERE child_id = ? AND topic_id = ? AND difficulty_id = ?";
  const params = [child_id, topic_id, difficulty_id];

  const [performances] = await db.execute(query, params);
  return performances;
};

const getOverallChildPerformance = async (child_id) => {
  const [performance] = await db.execute(
    `
    SELECT
      child_id,
      SUM(questions_attempted) AS total_questions_completed,
      ROUND(SUM(accuracy_score * questions_attempted) / SUM(questions_attempted), 2) AS overall_score,
      ROUND(SUM(average_time_spent * questions_attempted) / SUM(questions_attempted), 2) AS average_time_per_question
    FROM Child_Performance
    WHERE child_id = ?
    GROUP BY child_id
    `,
    [child_id]
  );

  return performance.length > 0 ? performance[0] : null;
};

const getChildPerformanceRecommendation = async (child_id) => {
  const [performance] = await db.execute(
    `
    SELECT
      child_id,
      topic_id,
      difficulty_id
    FROM Child_Performance
    WHERE child_id = ?
    ORDER BY accuracy_score ASC, average_time_spent DESC
    LIMIT 1
    `,
    [child_id]
  );

  return performance.length > 0 ? performance[0] : null;

}

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
  await db.execute("DELETE FROM Child_Performance WHERE child_id = ?", [
    child_id,
  ]);
};

module.exports = {
  getChildPerformanceByChildIdAndTopicId,
  getChildPerformanceByChildIdTopicIdAndDifficultyLevel,
  getOverallChildPerformance,
  getChildPerformanceRecommendation,
  deleteChildPerformanceByUpId,
  deleteChildPerformanceByChildId,
  getChildPerformanceByChildId,
};

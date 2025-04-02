export interface ChildPerformance {
  child_id: number;
  topic_id: number;
  total_time_spent: number;
  total_questions_attempted: number;
  average_accuracy_score: number;
  average_time_per_question: number;
}

export interface OverallPerformance {
  total_questions_completed: number;
  overall_score: number;
  average_time_per_question: number;
}
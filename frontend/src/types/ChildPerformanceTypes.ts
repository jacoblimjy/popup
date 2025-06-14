export interface ChildPerformance {
  child_id: number;
  topic_id: number;
  total_time_spent: number;
  total_questions_attempted: number;
  average_accuracy_score: number;
  average_time_per_question: number;
}

export interface ChildPerformanceResponse {
  child_id: number;
  topic_id: number;
  total_time_spent: string;
  total_questions_attempted: string;
  average_accuracy_score: string;
  average_time_per_question: string;
}

export interface OverallPerformance {
  total_questions_completed: number;
  overall_score: number;
  average_time_per_question: number;
}

export interface Recommendation {
  topic_id: number;
  difficulty_id: number;
}
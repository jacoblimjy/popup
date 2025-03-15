export interface Attempt {
  total_questions: number;
  correct_answers: number;
  score: number;
}

export interface AttemptedSet extends Attempt {
  child_id: number;
  topic_id: number;
  time_spent: number,
}
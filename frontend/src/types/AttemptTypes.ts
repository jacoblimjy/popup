export interface Attempt {
  total_questions: number;
  correct_answers: number;
  score: number;
}

export interface AttemptedSetRequest extends Attempt {
  child_id: number;
  topic_id: number;
  time_spent: number,
}

export interface AttemptedSetResponse extends AttemptedSetRequest {
  set_id: number;
  attempt_timestamp: string;
}
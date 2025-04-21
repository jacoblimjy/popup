export interface Attempt {
  total_questions: number;
  correct_answers: number;
  score: number;
}

export interface CreateAttemptedSetRequest extends Attempt {
  child_id: number;
  topic_id: number;
  time_spent: number,
}

export interface CreateAttemptedSetResponse {
  set_id: number;
  attempt_timestamp: string;
}

export interface GetAttemptedSetResponse {
  set_id: number;
  child_id: number;
  topic_id: number;
  total_questions: number;
  correct_answers: number;
  score: string;
  time_spent: number;
  difficulty_id: number;
  attempt_timestamp: string;
  attempted_questions: AttemptedQuestionResponse[];
}

export interface AttemptedSet {
  set_id: number;
  child_id: number;
  topic_id: number;
  total_questions: number;
  correct_answers: number;
  score: string;
  time_spent: number;
  difficulty_id: number;
  attempt_timestamp: string;
  attempted_questions: AttemptedQuestion[];
}

export interface AttemptedQuestionResponse {
  aq_id: number;
  question_id: number;
  question_text: string;
  difficulty_id: number;
  correct_answer: string;
  distractors: string[];
  child_answer: string;
  is_correct : number;
  explanation: string;
  attempt_timestamp: string;
  time_spent: number;
}

export interface AttemptedQuestion {
  aq_id: number;
  question_id: number;
  question_text: string;
  difficulty_id: number;
  correct_answer: string;
  options: string[];
  child_answer: string;
  is_correct : number;
  explanation: string;
  attempt_timestamp: string;
  time_spent: number;
}
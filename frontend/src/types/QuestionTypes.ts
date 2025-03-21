export interface Question {
  question_id: number;
  question_text: string;
  answer_format: string;
  correct_answer: string;
  options: string[];
  topic_id: number;
  difficulty_id: number;
  child_answer: string | null;
  time_taken: number;
}

export interface QuestionApiResponse {
  question_id: number;
  question_text: string;
  answer_format: string;
  correct_answer: string;
  distractors: string[];
  topic_id: number;
  difficulty_id: number;
  date_created: string;
  last_modified: string;
  is_llm_generated: number;
}

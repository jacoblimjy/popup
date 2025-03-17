export interface Question {
  question_id: number;
  question_text: string;
  answer_format: string;
  correct_answer: string;
  options: string[];
  topic_id: number;
  difficulty_id: number;
  selectedOption: string | null;
}

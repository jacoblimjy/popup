export interface PendingQuestion {
	pending_question_id: number;
	question_text: string;
	correct_answer: string;
	distractors: string[];
	explanation: string;
	topic_id: number;
	difficulty_id: number;
	date_created: string;
	is_llm_generated: boolean;
}

export interface QuestionGenerationParams {
	questionTypes: string[];
	difficulty: string;
	numQuestions: number;
}

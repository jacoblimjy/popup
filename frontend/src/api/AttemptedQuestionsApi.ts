import { Question } from "../types/QuestionTypes";
import apiClient from "./apiClient";

const BASE_URL = "http://localhost:8000/api/attempted_questions";

const createAttemptedQuestionsBulk = async (attemptedQuestions: Question[], set_id: number, child_id: number) => {
  const req_body = attemptedQuestions.map((question) => {
    return {
      child_id : child_id,
      set_id : set_id,
      question_id : question.question_id,
      child_answer : question.child_answer,
      is_correct : question.correct_answer === question.child_answer,
      time_spent : question.time_taken
    }
  });

  return apiClient(BASE_URL + "/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });
}

export default {
  createAttemptedQuestionsBulk
}
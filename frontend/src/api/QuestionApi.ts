import apiClient from "./ApiClient";

const BASE_URL = "http://localhost:8000/api/questions";

const getPracticeQuestions = async (topic_id: string, difficulty_id: string) => {
  return apiClient(`${BASE_URL}?topic_id=${topic_id}&difficulty_id=${difficulty_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  getPracticeQuestions,
}
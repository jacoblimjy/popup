import apiClient from "./apiClient";

const BASE_URL = "http://localhost:8000/api/questions";

const getQuestionsByTopicAndDifficulty = async (topic_id: string, difficulty_id: string) => {
  return apiClient(`${BASE_URL}?topic_id=${topic_id}&difficulty_id=${difficulty_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const getQuestionsBySetId = async (set_id: string) => {
  return apiClient(`${BASE_URL}/redo/${set_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  getQuestionsByTopicAndDifficulty,
  getQuestionsBySetId,
}
import apiClient from "./ApiClient";

const BASE_URL = "http://localhost:8000/api/child_performances";

const getChildPerformanceByChildId = async (child_id: number) => {
  return apiClient(BASE_URL + `?child_id=${child_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const getOverallPerformanceByChildId = async (child_id: number) => {
  return apiClient(BASE_URL + `/overall/${child_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default {
  getChildPerformanceByChildId,
  getOverallPerformanceByChildId
}
import { Attempt, AttemptedSetRequest, AttemptedSetResponse } from "../types/AttemptTypes";
import apiClient from "./ApiClient";
const BASE_URL = "http://localhost:8000/api/attempted_sets";

const createAttemptedSet = async (attemptedSet : AttemptedSetRequest) => {
  const req_body = {
    ...attemptedSet
  }

  return apiClient(BASE_URL + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });
}

const updateAttemptedSet = async (updated_attempt : Attempt, set_id: number) => {
  const req_body = {
    ...updated_attempt
  }

  return apiClient(BASE_URL + `/${set_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });
}

const getAttemptedSets = async (child_id : number, page_id: number = 1) : Promise<AttemptedSetResponse[]> => {
  return apiClient(BASE_URL + `?child_id=${child_id}&page=${page_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const deleteAttemptedSetBySetId = async (set_id : number) => {
  return apiClient(BASE_URL + `/${set_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const deleteAttemptedSetByChildId = async (child_id : number) => {
  return apiClient(BASE_URL + `/child/${child_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}



export default {
  createAttemptedSet,
  updateAttemptedSet,
  getAttemptedSets,
  deleteAttemptedSetBySetId,
  deleteAttemptedSetByChildId
}
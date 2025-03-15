import { Attempt, AttemptedSet } from "../types/AttemptTypes";
const BASE_URL = "http://localhost:8000/api/attempted_sets";

const createAttemptedSet = async (attemptedSet : AttemptedSet) => {
  const req_body = {
    ...attemptedSet
  }

  const response = await fetch(BASE_URL + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });

  if (!response.ok) {
    throw new Error("createAttemptedSet failed "+ response.statusText);
  }

  return response.json();
}

const updateAttemptedSet = async (updated_attempt : Attempt, set_id: number) => {
  const req_body = {
    ...updated_attempt
  }

  const response = await fetch(BASE_URL + `/${set_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });

  if (!response.ok) {
    throw new Error("updateAttemptedSet failed "+ response.statusText);
  }

  return response.json();
}

const getAttemptedSets = async (child_id : number, page_id: number = 1) => {
  const response = await fetch(BASE_URL + `?child_id=${child_id}&page=${page_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("getAttemptedSets failed "+ response.statusText);
  }

  return response.json();
}

const deleteAttemptedSetBySetId = async (set_id : number) => {
  const response = await fetch(BASE_URL + `/${set_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("deleteAttemptedSetById failed "+ response.statusText);
  }
  return response.json();
}

const deleteAttemptedSetByChildId = async (child_id : number) => {
  const response = await fetch(BASE_URL + `/child/${child_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("deleteAttemptedSetByChildId failed "+ response.statusText);
  }
  return response.json();
}



export default {
  createAttemptedSet,
  updateAttemptedSet,
  getAttemptedSets,
  deleteAttemptedSetBySetId,
  deleteAttemptedSetByChildId
}
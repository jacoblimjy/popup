import { Child, DetailedChild } from "../types/UserTypes";
import { getUserId } from "../utils";
import apiClient from "./ApiClient";
const BASE_URL = "http://localhost:8000/api/children";

const createChild = async (child : Child) => {
  const userId = getUserId();
  const req_body = {
    userId: userId,
    ...child
  }
  return apiClient(BASE_URL + "/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });
}

const updateChild = async (child : DetailedChild) => {
  const req_body = {
    child_name: child.child_name,
    age: child.age,
    education_level: child.education_level
  }
  return apiClient(BASE_URL + `/${child.child_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });
}

const getChildById = async (childId : string) => {
  return apiClient(BASE_URL + `/${childId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const getChildrenByUserId = async () => {
  const userId = getUserId();
  return apiClient(BASE_URL + `/?user_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const deleteChild = async (childId : number) => {
  return apiClient(BASE_URL + `/${childId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export default {
  createChild,
  updateChild,
  getChildById,
  getChildrenByUserId,
  deleteChild,
};
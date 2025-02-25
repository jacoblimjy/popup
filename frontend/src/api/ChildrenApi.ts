import { Child, DetailedChild } from "../types/UserTypes";
import { getUserId } from "../utils";
const BASE_URL = "http://localhost:8000/api/children";

const createChild = async (child : Child) => {
  const userId = getUserId();
  const req_body = {
    userId: userId,
    ...child
  }
  const response = await fetch(BASE_URL + "/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });

  if (!response.ok) {
    throw new Error("createChild failed "+ response.statusText);
  }

  return response.json();
}

const updateChild = async (child : DetailedChild) => {
  const req_body = {
    child_name: child.child_name,
    age: child.age,
    education_level: child.education_level
  }
  const response = await fetch(BASE_URL + `/${child.child_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req_body),
  });

  if (!response.ok) {
    throw new Error("updateChild failed "+ response.statusText);
  }

  return response.json();
}

const getChildById = async (childId : string) => {
  const response = await fetch(BASE_URL + `/${childId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("getChildById failed "+ response.statusText);
  }

  return response.json();
}

const getChildrenByUserId = async () => {
  const userId = getUserId();
  const response = await fetch(BASE_URL + `/?user_id=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("getChildrenByUserId failed "+ response.statusText);
  }

  return response.json();
}

const deleteChild = async (childId : number) => {
  const response = await fetch(BASE_URL + `/${childId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("deleteChild failed "+ response.statusText);
  }

  return response.json();
}


export default {
  createChild,
  updateChild,
  getChildById,
  getChildrenByUserId,
  deleteChild,
};
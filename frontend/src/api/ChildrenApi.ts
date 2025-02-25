import { Child } from "../types/UserTypes";
const BASE_URL = "http://localhost:8000/api/children";
const userId = localStorage.getItem("userId");

const createChild = async (child : Child) => {
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

const updateChild = async (child : Child) => {
  const req_body = {
    childName: child.childName,
    age: child.age,
    education_level: child.education_level
  }
  const response = await fetch(BASE_URL + `/${child.childId}`, {
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
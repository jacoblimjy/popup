import { Child } from "../types/UserTypes";
import apiClient from "./apiClient";

const BASE_URL = "http://localhost:8000/api/auth";

const login = async (email: string, password: string) => {
  return apiClient(BASE_URL + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
};

const signup = async (username: string, email: string, children: Child[], password: string) => {
  return apiClient(BASE_URL + "/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, children, password }),
  });
};

const updateProfile = async (
	userId: number,
	username: string,
	email: string,
	password?: string
) => {
	// We do a PUT /api/users/:id
	const url = `http://localhost:8000/api/users/${userId}`;
	return apiClient(url, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, email, password }),
	});
};

export default {
	login,
	signup,
	updateProfile, // <-- make sure to export it
};

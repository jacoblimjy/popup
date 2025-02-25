import { Child } from "../types/UserTypes";

const BASE_URL = "http://localhost:8000/api/users";

const login = async (email: string, password: string) => {
  const response = await fetch(BASE_URL + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed "+ response.statusText);
  }

  return response.json();
};

const signup = async (username: string, email: string, children: Child[], password: string) => {
  const response = await fetch(BASE_URL + "/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, children, password }),
  });

  if (!response.ok) {
    throw new Error('Sign up failed ' + response.statusText);
  }

  return response.json();
}

export default {
  login,
  signup
};

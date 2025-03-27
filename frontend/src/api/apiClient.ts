import { getSessionTimeoutHandler } from "../utils";

const apiClient = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (response.status === 403) {
    const handleSessionTimeout = getSessionTimeoutHandler();
    if (handleSessionTimeout) {
      handleSessionTimeout();
    }
    return;
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default apiClient;
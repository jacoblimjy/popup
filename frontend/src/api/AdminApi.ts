// src/api/adminAPI.ts
import apiClient from "./apiClient";
import { PendingQuestion } from "../types/AdminTypes";

// Hard-code the base URL for your admin endpoints
// (Adjust the port if your server is at http://localhost:8000 or some other URL)
const ADMIN_BASE_URL = "http://localhost:8000/api";

interface GenerateQuestionsParams {
	questionTypes: string[];
	difficulty: string;
	numQuestions: number;
}

/**
 * All admin routes for question management
 */
export const adminAPI = {
	generateQuestions: async (params: GenerateQuestionsParams, token: string) => {
		// e.g. POST /api/llm/questions/generate
		return apiClient(`${ADMIN_BASE_URL}/llm/questions/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				question_types: params.questionTypes, // the array
				difficulty_level: params.difficulty,
				num_questions: params.numQuestions,
			}),
		});
	},

	getPendingQuestions: async (token: string) => {
		// e.g. GET /api/pending_questions
		return apiClient(`${ADMIN_BASE_URL}/pending_questions`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	},

	approveQuestion: async (id: number, token: string) => {
		// e.g. POST /api/pending_questions/convert/:id
		return apiClient(`${ADMIN_BASE_URL}/pending_questions/convert/${id}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	},

	rejectQuestion: async (id: number, token: string) => {
		// e.g. DELETE /api/pending_questions/:id
		return apiClient(`${ADMIN_BASE_URL}/pending_questions/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	},

	updatePendingQuestion: async (
		id: number,
		data: Partial<PendingQuestion>,
		token: string
	) => {
		// e.g. PUT /api/pending_questions/:id
		return apiClient(`${ADMIN_BASE_URL}/pending_questions/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});
	},
};

import React, { useState, useEffect } from "react";
import {
	CheckCircle,
	XCircle,
	Edit2,
	ChevronDown,
	FilePlus,
} from "lucide-react";
import { adminAPI } from "../api/admin"; // or your actual path
import { PendingQuestion } from "../types/AdminTypes";

type ActionType = "generate" | "approve" | "reject";

interface EditData {
	pending_question_id: number;
	question_text: string;
	correct_answer: string;
	distractors: string[];
	explanation: string;
}

const AdminPage: React.FC = () => {
	// 1) Tabs
	const [activeTab, setActiveTab] = useState<"generate" | "review">("generate");

	// 2) Generate tab form
	const [questionTypes, setQuestionTypes] = useState<string[]>([]);
	const [difficulty, setDifficulty] = useState("Easy");
	const [numberOfQuestions, setNumberOfQuestions] = useState(5);

	// 3) List of pending questions
	const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>(
		[]
	);
	const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
		null
	);

	// 4) Confirm (Generate/Approve/Reject) modal
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
	const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// 5) Edit modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);
	const [editData, setEditData] = useState<EditData>({
		pending_question_id: 0,
		question_text: "",
		correct_answer: "",
		distractors: ["", "", "", ""],
		explanation: "",
	});

	// 6) Auth token from localStorage
	const token = localStorage.getItem("token") || "";

	// ============== Data Fetching ==============
	const fetchPendingQuestions = async () => {
		try {
			const data = await adminAPI.getPendingQuestions(token);
			// data should be an array of pending questions from the backend
			setPendingQuestions(data);
		} catch (error) {
			console.error("Failed to fetch pending questions:", error);
			// If fetching fails, fallback to an empty array or handle error
			setPendingQuestions([]);
		}
	};

	useEffect(() => {
		fetchPendingQuestions();
	}, []);

	// ============== Action Handlers ==============
	/** Toggle question type checkboxes */
	const handleToggleQuestionType = (type: string) => {
		if (questionTypes.includes(type)) {
			setQuestionTypes(questionTypes.filter((t) => t !== type));
		} else {
			setQuestionTypes([...questionTypes, type]);
		}
	};

	/** Handler: request to generate questions (open confirm modal) */
	const requestGenerateQuestions = () => {
		if (questionTypes.length === 0) {
			alert("Please select at least one topic.");
			return;
		}
		setCurrentAction("generate");
		setShowConfirmModal(true);
	};

	/** Handler: request to approve question (open confirm modal) */
	const requestApprove = (id: number) => {
		setCurrentAction("approve");
		setTargetQuestionId(id);
		setShowConfirmModal(true);
	};

	/** Handler: request to reject question (open confirm modal) */
	const requestReject = (id: number) => {
		setCurrentAction("reject");
		setTargetQuestionId(id);
		setShowConfirmModal(true);
	};

	/** Handler: open edit modal with existing data */
	const requestEdit = (pending_question_id: number) => {
		const target = pendingQuestions.find(
			(pq) => pq.pending_question_id === pending_question_id
		);
		if (!target) return;

		// Fill modal with pending question data
		setEditData({
			pending_question_id: target.pending_question_id,
			question_text: target.question_text,
			correct_answer: target.correct_answer,
			distractors: target.distractors,
			explanation: target.explanation,
		});
		setShowEditModal(true);
	};

	/** Toggle explanation collapsible */
	const toggleExplanation = (id: number) => {
		setExpandedQuestionId((prev) => (prev === id ? null : id));
	};

	// ============== Confirm Modal (Generate/Approve/Reject) ==============
	const cancelModal = () => {
		setShowConfirmModal(false);
		setCurrentAction(null);
		setTargetQuestionId(null);
		setIsProcessing(false);
	};

	const confirmAction = async () => {
		if (!currentAction) return;
		setIsProcessing(true);

		try {
			if (currentAction === "generate") {
				// 1) Call your adminAPI.generateQuestions
				const response = await adminAPI.generateQuestions(
					{
						questionTypes,
						difficulty,
						numQuestions: numberOfQuestions,
					},
					token
				);
				alert(response.message || "Questions generated successfully!");
				// 2) Refresh pending questions
				await fetchPendingQuestions();
			} else if (currentAction === "approve") {
				if (targetQuestionId == null) return;
				// 1) Call adminAPI.approveQuestion
				await adminAPI.approveQuestion(targetQuestionId, token);
				alert("Question approved!");
				// 2) Refresh pending questions
				await fetchPendingQuestions();
			} else if (currentAction === "reject") {
				if (targetQuestionId == null) return;
				// 1) Call adminAPI.rejectQuestion
				await adminAPI.rejectQuestion(targetQuestionId, token);
				alert("Question rejected!");
				// 2) Refresh pending questions
				await fetchPendingQuestions();
			}
		} catch (error) {
			console.error("Action failed:", error);
			alert("Action failed. Please check console for details.");
		} finally {
			setIsProcessing(false);
			setShowConfirmModal(false);
			setCurrentAction(null);
			setTargetQuestionId(null);
		}
	};

	// ============== Edit Modal ==============
	/** 'Save Changes' in the edit modal triggers a confirm modal */
	const handleSaveEdit = () => {
		setShowConfirmEditModal(true);
	};

	/** Cancel the edit operation entirely */
	const cancelEdit = () => {
		setShowEditModal(false);
		setShowConfirmEditModal(false);
	};

	/** Confirm actually saving the changes to the backend */
	const confirmSaveEdit = async () => {
		try {
			// Prepare data for the update
			// The backend requires fields: question_text, answer_format, correct_answer, distractors, topic_id, difficulty_id, explanation
			// We'll assume default values for topic_id/difficulty_id just for demonstration
			const updateData = {
				question_text: editData.question_text,
				answer_format: "multiple_choice",
				correct_answer: editData.correct_answer,
				distractors: editData.distractors,
				topic_id: 1, // You can change this based on your real topic mapping
				difficulty_id: 1, // Or set it from the existing question
				explanation: editData.explanation,
			};

			// 1) Call adminAPI.updatePendingQuestion
			await adminAPI.updatePendingQuestion(
				editData.pending_question_id,
				updateData,
				token
			);

			alert("Question updated successfully!");
			// 2) Refresh pending questions
			await fetchPendingQuestions();

			// 3) Close modals
			setShowConfirmEditModal(false);
			setShowEditModal(false);
		} catch (error) {
			console.error("Failed to edit question:", error);
			alert("Failed to edit question. Check console for details.");
		}
	};

	// ============== Render ==============
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Tabs */}
				<div
					className="flex space-x-2 bg-white rounded-md shadow p-1 border border-gray-200"
					role="tablist"
				>
					{/* Generate Tab */}
					<button
						role="tab"
						aria-selected={activeTab === "generate"}
						className={`flex-1 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
							activeTab === "generate"
								? "bg-blue-600 text-white font-semibold"
								: "text-gray-700 hover:bg-gray-100"
						}`}
						onClick={() => setActiveTab("generate")}
					>
						Generate Questions
					</button>

					{/* Review Tab */}
					<button
						role="tab"
						aria-selected={activeTab === "review"}
						className={`flex-1 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
							activeTab === "review"
								? "bg-blue-600 text-white font-semibold"
								: "text-gray-700 hover:bg-gray-100"
						}`}
						onClick={() => setActiveTab("review")}
					>
						Review Pending ({pendingQuestions.length})
					</button>
				</div>

				{/* ========== Generate Tab Panel ========== */}
				{activeTab === "generate" && (
					<div
						className="bg-white rounded-md shadow p-6 border border-gray-200 space-y-6"
						role="tabpanel"
						aria-label="Generate new questions"
					>
						<div className="flex items-center space-x-2 mb-4">
							<FilePlus className="w-5 h-5 text-blue-600" />
							<h2 className="text-lg font-semibold text-gray-800">
								Generate New Questions
							</h2>
						</div>

						{/* Question Types */}
						<div>
							<h3 className="text-base font-medium mb-2 text-gray-700">
								Topics
							</h3>
							<div className="space-y-2">
								{[
									"Use a Rule to Make a Word",
									"Complete a Word Pair",
									"Word Ladders",
									"Anagram in a Sentence",
								].map((type) => (
									<label
										key={type}
										className="flex items-center space-x-2 text-gray-700 cursor-pointer"
									>
										<input
											type="checkbox"
											className="form-checkbox h-4 w-4 text-blue-600 transition-colors"
											checked={questionTypes.includes(type)}
											onChange={() => handleToggleQuestionType(type)}
										/>
										<span className="text-sm">{type}</span>
									</label>
								))}
							</div>
							{questionTypes.length === 0 && (
								<p className="text-red-600 text-xs mt-1">
									Please select at least one topic
								</p>
							)}
						</div>

						{/* Difficulty */}
						<div>
							<h3 className="text-base font-medium mb-2 text-gray-700">
								Difficulty Level
							</h3>
							<div className="flex space-x-2">
								{["Easy", "Medium", "Hard"].map((level) => (
									<button
										key={level}
										onClick={() => setDifficulty(level)}
										className={`px-4 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
											difficulty === level
												? "bg-blue-600 text-white border-blue-600"
												: "border-gray-300 text-gray-700 hover:bg-gray-100"
										}`}
									>
										{level}
									</button>
								))}
							</div>
						</div>

						{/* Number of Questions */}
						<div>
							<h3 className="text-base font-medium mb-2 text-gray-700">
								Number of Questions
							</h3>
							<input
								type="number"
								min={1}
								max={5}
								className="w-20 border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
								value={numberOfQuestions}
								onChange={(e) => {
									let newVal = Number(e.target.value);
									if (newVal < 1) newVal = 1;
									if (newVal > 5) newVal = 5;
									setNumberOfQuestions(newVal);
								}}
							/>
						</div>

						{/* Generate Button */}
						<div className="pt-2">
							<button
								onClick={requestGenerateQuestions}
								disabled={questionTypes.length === 0}
								className={`inline-flex items-center space-x-2 px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
									questionTypes.length === 0
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: "bg-blue-600 text-white hover:bg-blue-700"
								}`}
							>
								<span>Generate Questions</span>
							</button>
						</div>
					</div>
				)}

				{/* ========== Review Tab Panel ========== */}
				{activeTab === "review" && (
					<div
						className="space-y-4"
						role="tabpanel"
						aria-label="Review pending questions"
					>
						<div className="flex items-center space-x-2">
							<ChevronDown className="w-5 h-5 text-blue-600" />
							<h2 className="text-lg font-semibold text-gray-800">
								Pending Questions for Review
							</h2>
						</div>

						{pendingQuestions.length === 0 && (
							<p className="text-sm text-gray-600">
								All questions have been reviewed!
							</p>
						)}

						{pendingQuestions.map((q) => (
							<div
								key={q.pending_question_id}
								className="bg-white rounded-md shadow p-4 border border-gray-200 transition-shadow hover:shadow-lg"
							>
								{/* Top Row: Type & Difficulty */}
								<div className="flex justify-between items-center mb-2">
									<div className="text-sm font-semibold text-gray-700">
										{/* For real usage, you might map topic_id to a label or fetch it from the backend. */}
										{q.topic_id === 1
											? "Use a Rule to Make a Word"
											: q.topic_id === 2
											? "Complete a Word Pair"
											: q.topic_id === 3
											? "Word Ladders"
											: q.topic_id === 4
											? "Anagram in a Sentence"
											: "Unknown Topic"}
									</div>
									<div
										className={`px-2 py-1 rounded-md text-xs font-semibold ${
											q.difficulty_id === 1
												? "bg-green-100 text-green-700" // Easy
												: q.difficulty_id === 2
												? "bg-orange-100 text-orange-700" // Medium
												: "bg-red-100 text-red-700" // Hard
										}`}
									>
										{q.difficulty_id === 1
											? "Easy"
											: q.difficulty_id === 2
											? "Medium"
											: "Hard"}
									</div>
								</div>

								{/* Question */}
								<p className="text-sm text-gray-800 mb-2">{q.question_text}</p>
								{/* Answer */}
								<p className="text-sm text-gray-700 font-semibold">
									Answer: {q.correct_answer}
								</p>
								{/* Distractors */}
								<p className="text-sm text-gray-700 mt-1">
									Distractors: {q.distractors.join(", ")}
								</p>

								{/* Explanation Collapsible */}
								<button
									className="flex items-center text-blue-600 text-sm mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200"
									onClick={() => toggleExplanation(q.pending_question_id)}
									aria-expanded={expandedQuestionId === q.pending_question_id}
									aria-controls={`explanation-${q.pending_question_id}`}
								>
									<span>
										{expandedQuestionId === q.pending_question_id
											? "Hide Explanation"
											: "Show Explanation"}
									</span>
								</button>
								<div
									id={`explanation-${q.pending_question_id}`}
									style={{
										maxHeight:
											expandedQuestionId === q.pending_question_id
												? "1000px"
												: "0px",
										overflow: "hidden",
										transition: "max-height 0.3s ease-in-out",
									}}
									className="mt-2 text-sm text-gray-600"
								>
									{expandedQuestionId === q.pending_question_id && (
										<>
											<strong>Explanation:</strong> {q.explanation}
											<p className="text-xs text-gray-400 mt-1">
												Created on: {q.date_created?.slice(0, 10)}
											</p>
										</>
									)}
								</div>

								{/* Action Buttons */}
								<div className="mt-3 flex space-x-2">
									<button
										onClick={() => requestApprove(q.pending_question_id)}
										className="flex-1 inline-flex items-center justify-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-md hover:bg-green-100 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
									>
										<CheckCircle className="w-4 h-4" />
										<span>Approve</span>
									</button>
									<button
										onClick={() => requestEdit(q.pending_question_id)}
										className="flex-1 inline-flex items-center justify-center space-x-1 bg-gray-50 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
									>
										<Edit2 className="w-4 h-4" />
										<span>Edit</span>
									</button>
									<button
										onClick={() => requestReject(q.pending_question_id)}
										className="flex-1 inline-flex items-center justify-center space-x-1 bg-red-50 text-red-700 px-2 py-1 rounded-md hover:bg-red-100 transition text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
									>
										<XCircle className="w-4 h-4" />
										<span>Reject</span>
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* === Confirm Modal (Generate/Approve/Reject) === */}
			{showConfirmModal && currentAction && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-96">
						<h2 className="text-lg font-semibold text-gray-900">
							{currentAction === "generate"
								? "Confirm Generate"
								: currentAction === "approve"
								? "Confirm Approve"
								: "Confirm Reject"}
						</h2>
						<p className="text-sm text-gray-600 mt-2">
							{currentAction === "generate"
								? "Are you sure you want to generate these questions?"
								: currentAction === "approve"
								? "Are you sure you want to approve this question?"
								: "Are you sure you want to reject this question?"}
						</p>
						<div className="mt-4 flex justify-end space-x-3">
							<button
								onClick={cancelModal}
								className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
								disabled={isProcessing}
							>
								Cancel
							</button>
							<button
								onClick={confirmAction}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
								disabled={isProcessing}
							>
								{isProcessing ? "Processing..." : "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* === Edit Modal === */}
			{showEditModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
						<h2 className="text-lg font-semibold text-gray-900">
							Edit Question
						</h2>

						{/* question_text */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Question
							</label>
							<textarea
								value={editData.question_text}
								onChange={(e) =>
									setEditData({ ...editData, question_text: e.target.value })
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
								rows={3}
							/>
						</div>

						{/* correct_answer */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Answer
							</label>
							<input
								type="text"
								value={editData.correct_answer}
								onChange={(e) =>
									setEditData({ ...editData, correct_answer: e.target.value })
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* distractors */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Distractors
							</label>
							{editData.distractors.map((d, index) => (
								<input
									key={index}
									type="text"
									value={d}
									onChange={(e) => {
										const newArr = [...editData.distractors];
										newArr[index] = e.target.value;
										setEditData({ ...editData, distractors: newArr });
									}}
									className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200 mb-2"
								/>
							))}
						</div>

						{/* explanation */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Explanation
							</label>
							<textarea
								value={editData.explanation}
								onChange={(e) =>
									setEditData({ ...editData, explanation: e.target.value })
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
								rows={3}
							/>
						</div>

						{/* Buttons */}
						<div className="mt-6 flex justify-end space-x-3">
							<button
								onClick={cancelEdit}
								className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveEdit}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
							>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}

			{/* === Confirm Edit Modal === */}
			{showConfirmEditModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-96">
						<h2 className="text-lg font-semibold text-gray-900">
							Confirm Edit
						</h2>
						<p className="text-sm text-gray-600 mt-2">
							Are you sure you want to save these changes?
						</p>
						<div className="mt-4 flex justify-end space-x-3">
							<button
								onClick={() => setShowConfirmEditModal(false)}
								className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
							>
								Cancel
							</button>
							<button
								onClick={confirmSaveEdit}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPage;

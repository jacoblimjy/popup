import React, { useState } from "react";
import {
	CheckCircle,
	XCircle,
	Edit2,
	ChevronDown,
	FilePlus,
} from "lucide-react";

/** Dummy Data for Pending Questions */
const DUMMY_QUESTIONS = [
	{
		id: 1,
		type: "Use a Rule to Make a Word",
		difficulty: "Medium",
		question: `If you remove the first letter from a 5-letter word meaning "small stream" and add "EN" at the end, you get a new word meaning "writing instrument". What is the original word?`,
		answer: "BROOK",
		explanation: `BROOK (small stream) -> ROOK + EN = ROOKEN (writing instrument)`,
		date: "2023-03-15",
	},
	{
		id: 2,
		type: "Complete a Word Pair",
		difficulty: "Easy",
		question: `GRASS is to GREEN as SKY is to _____`,
		answer: "BLUE",
		explanation: `GRASS is GREEN in color. Similarly, SKY is BLUE in color.`,
		date: "2023-03-15",
	},
	{
		id: 3,
		type: "Word Ladders",
		difficulty: "Easy",
		question: `Change COLD to WARM in exactly 4 steps, changing only one letter at a time to make a new word at each step.`,
		answer: `COLD -> ... -> WARM`,
		explanation: `A typical ladder could be: COLD -> CORD -> WORD -> WORM -> WARM`,
		date: "2023-03-15",
	},
];

// Action types that require a simple confirm modal
type ActionType = "generate" | "approve" | "reject";

interface Question {
	id: number;
	type: string;
	difficulty: string;
	question: string;
	answer: string;
	explanation: string;
	date: string;
}

const AdminInterface: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"generate" | "review">("generate");

	// Generate Questions form state
	const [questionTypes, setQuestionTypes] = useState<string[]>([]);
	const [difficulty, setDifficulty] = useState("Easy");
	const [numberOfQuestions, setNumberOfQuestions] = useState(5);

	// List of questions pending review
	const [pendingQuestions, setPendingQuestions] =
		useState<Question[]>(DUMMY_QUESTIONS);

	// Track collapsible explanation state
	const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
		null
	);

	// ========== 1) SIMPLE CONFIRM MODAL STATE ==========
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
	const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// ========== 2) EDIT MODAL & CONFIRMATION STATE ==========
	const [showEditModal, setShowEditModal] = useState(false);
	const [showConfirmEditModal, setShowConfirmEditModal] = useState(false);

	// The data we are editing
	const [editData, setEditData] = useState<{
		id: number;
		question: string;
		answer: string;
		explanation: string;
	}>({
		id: 0,
		question: "",
		answer: "",
		explanation: "",
	});

	// ============= ACTION HANDLERS =============
	const handleToggleQuestionType = (type: string) => {
		if (questionTypes.includes(type)) {
			setQuestionTypes(questionTypes.filter((t) => t !== type));
		} else {
			setQuestionTypes([...questionTypes, type]);
		}
	};

	// ====== GENERATE ======
	const requestGenerateQuestions = () => {
		// Quick check to ensure at least one question type
		if (questionTypes.length === 0) {
			alert("Please select at least one question type before generating.");
			return;
		}
		setCurrentAction("generate");
		setShowConfirmModal(true);
	};

	// ====== APPROVE ======
	const requestApprove = (id: number) => {
		setCurrentAction("approve");
		setTargetQuestionId(id);
		setShowConfirmModal(true);
	};

	// ====== REJECT ======
	const requestReject = (id: number) => {
		setCurrentAction("reject");
		setTargetQuestionId(id);
		setShowConfirmModal(true);
	};

	// ====== EDIT ======
	const requestEdit = (questionId: number) => {
		const q = pendingQuestions.find((item) => item.id === questionId);
		if (!q) return;
		// Put relevant fields into editData
		setEditData({
			id: q.id,
			question: q.question,
			answer: q.answer,
			explanation: q.explanation,
		});
		setShowEditModal(true);
	};

	const toggleExplanation = (id: number) => {
		setExpandedQuestionId((prev) => (prev === id ? null : id));
	};

	// =========== SIMPLE CONFIRM MODAL LOGIC ===========
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
			switch (currentAction) {
				case "generate": {
					console.log("Generating questions with:", {
						questionTypes,
						difficulty,
						numberOfQuestions,
					});
					// Simulate an API call
					await new Promise((res) => setTimeout(res, 500));
					alert("Questions generated! (Dummy)");
					break;
				}
				case "approve": {
					if (targetQuestionId == null) return;
					console.log("Approved question with ID:", targetQuestionId);
					await new Promise((res) => setTimeout(res, 500));
					setPendingQuestions(
						pendingQuestions.filter((q) => q.id !== targetQuestionId)
					);
					alert("Question approved (Dummy)!");
					break;
				}
				case "reject": {
					if (targetQuestionId == null) return;
					console.log("Rejected question with ID:", targetQuestionId);
					await new Promise((res) => setTimeout(res, 500));
					setPendingQuestions(
						pendingQuestions.filter((q) => q.id !== targetQuestionId)
					);
					alert("Question rejected (Dummy)!");
					break;
				}
			}
		} catch (error) {
			console.error("Error occurred: ", error);
			alert("Action failed. Please try again.");
		} finally {
			setIsProcessing(false);
			setShowConfirmModal(false);
			setCurrentAction(null);
			setTargetQuestionId(null);
		}
	};

	// =========== EDIT FORM + CONFIRMATION LOGIC ===========
	const handleSaveEdit = () => {
		setShowConfirmEditModal(true);
	};

	const cancelEdit = () => {
		setShowEditModal(false);
		setShowConfirmEditModal(false);
	};

	const confirmSaveEdit = async () => {
		try {
			// 1) Update in local state
			setPendingQuestions((prev) =>
				prev.map((q) =>
					q.id === editData.id
						? {
								...q,
								question: editData.question,
								answer: editData.answer,
								explanation: editData.explanation,
						  }
						: q
				)
			);

			// 2) Close modals
			setShowConfirmEditModal(false);
			setShowEditModal(false);

			alert("Question updated successfully! ✅");
		} catch (err) {
			console.error("Failed to edit question", err);
			alert("Failed to edit question. Please try again.");
		}
	};

	// =============== RENDER ===============
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* TABS */}
				<div
					className="flex space-x-2 bg-white rounded-md shadow p-1 border border-gray-200"
					role="tablist"
				>
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

				{/* PANEL: GENERATE QUESTIONS */}
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
									Please select at least one question type
								</p>
							)}
						</div>

						{/* Difficulty Level */}
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

						{/* Number of Questions (capped at 5) */}
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
									// Clamp the input to [1..5]
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

				{/* PANEL: REVIEW QUESTIONS */}
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
								key={q.id}
								className="bg-white rounded-md shadow p-4 border border-gray-200 transition-shadow hover:shadow-lg"
							>
								{/* Top Row: Type & Difficulty */}
								<div className="flex justify-between items-center mb-2">
									<div className="text-sm font-semibold text-gray-700">
										{q.type}
									</div>
									<div
										className={`px-2 py-1 rounded-md text-xs font-semibold ${
											q.difficulty === "Easy"
												? "bg-green-100 text-green-700"
												: q.difficulty === "Medium"
												? "bg-orange-100 text-orange-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{q.difficulty}
									</div>
								</div>

								{/* Question */}
								<p className="text-sm text-gray-800 mb-2">{q.question}</p>
								{/* Answer */}
								<p className="text-sm text-gray-700 font-semibold">
									Answer: {q.answer}
								</p>

								{/* Collapsible Explanation */}
								<button
									className="flex items-center text-blue-600 text-sm mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200"
									onClick={() => toggleExplanation(q.id)}
									aria-expanded={expandedQuestionId === q.id}
									aria-controls={`explanation-${q.id}`}
								>
									<span>
										{expandedQuestionId === q.id
											? "Hide Explanation"
											: "Show Explanation"}
									</span>
								</button>
								<div
									id={`explanation-${q.id}`}
									style={{
										maxHeight: expandedQuestionId === q.id ? "1000px" : "0px",
										overflow: "hidden",
										transition: "max-height 0.3s ease-in-out",
									}}
									className="mt-2 text-sm text-gray-600"
								>
									{expandedQuestionId === q.id && (
										<>
											<strong>Explanation:</strong> {q.explanation}
											<p className="text-xs text-gray-400 mt-1">
												Created on: {q.date}
											</p>
										</>
									)}
								</div>

								{/* Action Buttons */}
								<div className="mt-3 flex space-x-2">
									<button
										onClick={() => requestApprove(q.id)}
										className="flex-1 inline-flex items-center justify-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-md hover:bg-green-100 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
									>
										<CheckCircle className="w-4 h-4" />
										<span>Approve</span>
									</button>
									<button
										onClick={() => requestEdit(q.id)}
										className="flex-1 inline-flex items-center justify-center space-x-1 bg-gray-50 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
									>
										<Edit2 className="w-4 h-4" />
										<span>Edit</span>
									</button>
									<button
										onClick={() => requestReject(q.id)}
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

			{/* === 1) SIMPLE CONFIRM MODAL === */}
			{showConfirmModal && currentAction && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
					{/* Modal Card */}
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-96">
						<h2 className="text-lg font-semibold text-gray-900">
							{(() => {
								switch (currentAction) {
									case "generate":
										return "Confirm Generate";
									case "approve":
										return "Confirm Approve";
									case "reject":
										return "Confirm Reject";
									default:
										return "Confirm Action";
								}
							})()}
						</h2>
						<p className="text-sm text-gray-600 mt-2">
							{(() => {
								switch (currentAction) {
									case "generate":
										return "Are you sure you want to generate these questions?";
									case "approve":
										return "Are you sure you want to approve this question?";
									case "reject":
										return "Are you sure you want to reject this question?";
									default:
										return "Are you sure you want to proceed?";
								}
							})()}
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

			{/* === 2) EDIT MODAL (FORM) === */}
			{showEditModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
						<h2 className="text-lg font-semibold text-gray-900">
							Edit Question
						</h2>

						{/* QUESTION TEXT */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Question
							</label>
							<textarea
								value={editData.question}
								onChange={(e) =>
									setEditData((prev) => ({ ...prev, question: e.target.value }))
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
								rows={3}
							/>
						</div>

						{/* ANSWER */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Answer
							</label>
							<input
								type="text"
								value={editData.answer}
								onChange={(e) =>
									setEditData((prev) => ({ ...prev, answer: e.target.value }))
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* EXPLANATION */}
						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700">
								Explanation
							</label>
							<textarea
								value={editData.explanation}
								onChange={(e) =>
									setEditData((prev) => ({
										...prev,
										explanation: e.target.value,
									}))
								}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
								rows={3}
							/>
						</div>

						{/* ACTION BUTTONS */}
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

			{/* === 2b) CONFIRM EDIT MODAL === */}
			{showConfirmEditModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
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

export default AdminInterface;

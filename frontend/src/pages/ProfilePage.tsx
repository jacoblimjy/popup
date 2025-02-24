import React, { useState } from "react";

const ProfilePage = () => {
	const [fullName, setFullName] = useState("Jessica McQueen");
	const [password, setPassword] = useState("password");
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const handleSaveChanges = () => {
		setShowConfirmModal(true);
	};

	const confirmSave = () => {
		setShowConfirmModal(false);
		alert("Profile updated successfully! ✅");
	};

	return (
		<>
			<div className="bg-gray-50 min-h-screen">
				<div className="max-w-2xl mx-auto px-6 pt-12">
					<h1 className="text-3xl font-semibold text-gray-900 mb-6">
						Profile (Parent)
					</h1>

					<div className="space-y-6">
						{/* Full Name */}
						<div>
							<label className="block text-gray-700 font-medium mb-1">
								Full Name
							</label>
							<input
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* Email (Disabled) */}
						<div>
							<label className="block text-gray-700 font-medium mb-1">
								Email
							</label>
							<input
								type="email"
								value="jessica@gmail.com"
								disabled
								className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-md text-gray-700 cursor-not-allowed"
							/>
						</div>

						{/* Password */}
						<div>
							<label className="block text-gray-700 font-medium mb-1">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* Save Changes Button */}
						<button
							onClick={handleSaveChanges}
							className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition"
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-xl font-semibold text-gray-900">
							Confirm Changes
						</h2>
						<p className="text-gray-600 mt-2">
							Are you sure you want to save these changes?
						</p>
						<div className="mt-4 flex justify-end space-x-3">
							<button
								onClick={() => setShowConfirmModal(false)}
								className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300"
							>
								Cancel
							</button>
							<button
								onClick={confirmSave}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ProfilePage;

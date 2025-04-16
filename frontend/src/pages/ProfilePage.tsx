/**
 * ProfilePage.tsx
 */
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import UserApi from "../api/UserApi";

const ProfilePage: React.FC = () => {
	const { user, login } = useAuth(); // from your AuthContext
	// Pre-fill fields from the user object
	const [fullName, setFullName] = useState(user ? user.username : "");
	// For security, don't show the real password. Let them type a new one if desired.
	const [password, setPassword] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleSaveChanges = () => {
		setShowConfirmModal(true);
	};

	const confirmSave = async () => {
		setIsSaving(true);
		try {
			if (!user) {
				throw new Error("No user logged in!");
			}
			// Call the API
			const updatedUser = await UserApi.updateProfile(
				user.userId, // user ID
				fullName, // new username
				user.email, // keep the same email for now
				password // new password if typed
			);

			// If the backend returns updated user data,
			// update the AuthContext with new username, etc.
			login({
				userId: user.userId,
				username: updatedUser.username,
				email: updatedUser.email,
				role_id: updatedUser.role_id,
			});

			setShowConfirmModal(false);
			alert("Profile updated successfully! ✅");
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Failed to update profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<div className="bg-gray-50 min-h-screen">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12">
					{/* Header Section (responsive stacking) */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
						<h1 className="text-3xl font-semibold text-gray-900">
							Profile (Parent)
						</h1>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
						{/* Full Name */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<input
								type="text"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* Email (Disabled) */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Email
							</label>
							<input
								type="email"
								value={user ? user.email : ""}
								disabled
								className="mt-1 w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-500 cursor-not-allowed"
							/>
						</div>

						{/* Password */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter new password"
								className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring focus:ring-blue-200"
							/>
						</div>

						{/* Save Changes Button */}
						<div className="flex justify-end">
							<button
								onClick={handleSaveChanges}
								className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition"
							>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 flex items-center justify-center">
					<div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-96">
						<h2 className="text-lg font-semibold text-gray-900">
							Confirm Changes
						</h2>
						<p className="text-sm text-gray-600 mt-2">
							Are you sure you want to save these changes?
						</p>
						<div className="mt-4 flex justify-end space-x-3">
							<button
								onClick={() => setShowConfirmModal(false)}
								className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
							>
								Cancel
							</button>
							<button
								onClick={confirmSave}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
								disabled={isSaving}
							>
								{isSaving ? "Saving..." : "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ProfilePage;

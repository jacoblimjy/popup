import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import AddChildModal from "../components/AddChildModal";
import EditChildModal from "../components/EditChildModal";
import { useChildrenList } from "../hooks/useChildrenList";
import { Child, DetailedChild } from "../types/UserTypes";
import ChildrenApi from "../api/ChildrenApi";
import { formatDate } from "../utils";

const ManageChildrenPage: React.FC = () => {
	const { childrenList, getChildrenList } = useChildrenList();
	const [currentChild, setCurrentChild] = useState<DetailedChild | null>(null);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	// Add Child Function
	const handleAddChild = async (child: Child) => {
		try {
			await ChildrenApi.createChild(child);
			await getChildrenList();
		} catch (error) {
			console.error(error);
		}
	};

	// Edit Child Function
	const handleEditChild = async (updatedChild: DetailedChild) => {
		try {
			await ChildrenApi.updateChild(updatedChild);
			await getChildrenList();
			setIsEditModalOpen(false);
		} catch (error) {
			console.error(error);
		}
	};

	// Delete Child Function
	const deleteChild = async (id: number) => {
		try {
			await ChildrenApi.deleteChild(id);
			await getChildrenList();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="max-w-2xl mx-auto px-6 pt-12">
				{/* Header */}
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-semibold text-gray-900">
						Manage Children
					</h1>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
					>
						+ Add Child
					</button>
				</div>

				{/* Child Cards */}
				<div className="space-y-4">
					{childrenList && childrenList.length > 0 ? childrenList.map((child) => (
						<div
							key={child.child_id}
							className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between border border-gray-200"
						>
							{/* Left Section (Avatar + Details) */}
							<div className="flex items-center space-x-4">
								<div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 font-bold">
									{child.child_name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p className="text-lg font-semibold text-gray-900">
										{child.child_name}
									</p>
									<p className="text-sm text-gray-500">Age {child.age}</p>
									<p className="text-xs text-gray-400">Joined {formatDate(child.date_created)}</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center space-x-4">
								<button
									className="p-2 rounded-lg hover:bg-gray-100 transition"
									onClick={() => {
										setCurrentChild(child);
										setIsEditModalOpen(true);
									}}
								>
									<Edit className="w-5 h-5 text-gray-500" />
								</button>
								<button
									className="p-2 rounded-lg hover:bg-gray-100 transition"
									onClick={() => deleteChild(child.child_id)}
								>
									<Trash2 className="w-5 h-5 text-red-500" />
								</button>
							</div>
						</div>
					)) :
						<p>No child added yet</p>
					}
				</div>
			</div>

			{/* Add Child Modal */}
			<AddChildModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAddChild={handleAddChild}
			/>

			{isEditModalOpen && currentChild && (
				<EditChildModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onEditChild={handleEditChild}
					child={currentChild}
				/>
			)}
		</div>
	);
};

export default ManageChildrenPage;

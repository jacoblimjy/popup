import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import AddChildModal from "../components/AddChildModal";
import EditChildModal from "../components/EditChildModal";

interface Child {
	id: number;
	name: string;
	age: number;
	joined: string;
}

const ManageChildrenPage: React.FC = () => {
	const [children, setChildren] = useState<Child[]>([
		{ id: 1, name: "Jane", age: 10, joined: "December 2021" },
		{ id: 2, name: "James", age: 11, joined: "December 2021" },
	]);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentChild, setCurrentChild] = useState<Child | null>(null);

	// Add Child Function
	const addChild = (child: { childName: string; age: number }) => {
		const newChild: Child = {
			id: Date.now(),
			name: child.childName,
			age: child.age,
			joined: new Date().toLocaleString("default", {
				month: "long",
				year: "numeric",
			}),
		};
		setChildren([...children, newChild]);
	};

	// Edit Child Function
	const editChild = (updatedChild: {
		id: number;
		childName: string;
		age: number;
	}) => {
		setChildren(
			children.map((child) =>
				child.id === updatedChild.id
					? { ...child, name: updatedChild.childName, age: updatedChild.age }
					: child
			)
		);
		setIsEditModalOpen(false);
	};

	// Delete Child Function
	const deleteChild = (id: number) => {
		setChildren(children.filter((child) => child.id !== id));
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
					{children.map((child) => (
						<div
							key={child.id}
							className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between border border-gray-200"
						>
							{/* Left Section (Avatar + Details) */}
							<div className="flex items-center space-x-4">
								<div className="w-10 h-10 bg-black rounded-full"></div>
								<div>
									<p className="text-lg font-semibold text-gray-900">
										{child.name}
									</p>
									<p className="text-sm text-gray-500">Age {child.age}</p>
									<p className="text-xs text-gray-400">Joined {child.joined}</p>
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
									onClick={() => deleteChild(child.id)}
								>
									<Trash2 className="w-5 h-5 text-red-500" />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Add Child Modal */}
			<AddChildModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAddChild={addChild}
			/>

			{isEditModalOpen && currentChild && (
				<EditChildModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onEditChild={editChild}
					child={{
						id: currentChild.id,
						childName: currentChild.name, // Ensure correct property mapping
						age: currentChild.age,
					}}
				/>
			)}
		</div>
	);
};

export default ManageChildrenPage;

import {
	Button,
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { Child } from "../types/UserTypes";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (child: Child) => void;
}

const AddChildModal = ({ isOpen, onClose, onAddChild }: AddChildModalProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const handleAddChild = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddChild({child_name: name, age: parseInt(age), education_level: parseInt(educationLevel) });
    resetFields();
    onClose();
  };

  const resetFields = () => {
    setName('');
    setAge('');
    setEducationLevel('');
  }

	if (!isOpen) return null;

	return (
		<Dialog
			open={isOpen}
			as="div"
			className="relative z-10 focus:outline-none"
			onClose={onClose}
		>
			<DialogBackdrop className="fixed inset-0 bg-black/30" />
			<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div className="flex min-h-full items-center justify-center p-4">
					<DialogPanel
						transition
						className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
					>
						{/* Modal Title */}
						<DialogTitle as="h3" className="text-base/7 font-medium text-black">
							Add Child
						</DialogTitle>
						<hr className="border-gray-300 mb-4" />

						{/* Form */}
						<form onSubmit={handleAddChild}>
							{/* Name Input */}
							<div>
								<label className="block text-sm mb-2">Name</label>
								<div className="relative">
									<input
										type="text"
										id="name"
										name="name"
										required
										autoComplete="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
									/>
								</div>
							</div>

							{/* Age Input */}
							<div className="mt-4">
								<label className="block text-sm mb-2">Age</label>
								<div className="relative">
									<input
										type="number"
										name="age"
										min={1}
										max={100}
										required
										autoComplete="age"
										value={age}
										onChange={(e) => setAge(e.target.value)}
										className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
									/>
								</div>
							</div>

              {/* Education Level Input */}
							<div className="mt-4">
								<label className="block text-sm mb-2">Education Level</label>
								<div className="relative">
									<input
										type="number"
										name="educationLevel"
										min={1}
										max={20}
										required
										autoComplete="educationLevel"
										value={educationLevel}
										onChange={(e) => setEducationLevel(e.target.value)}
										className="py-3 px-4 block w-full rounded-md bg-white text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
									/>
								</div>
							</div>

							{/* Buttons */}
							<div className="mt-4 flex justify-between">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition"
								>
									Cancel
								</button>
								<Button
									className="inline-flex items-center gap-2 rounded-md bg-blue-600 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-700 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
									type="submit"
								>
									Confirm
								</Button>
							</div>
						</form>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
};

export default AddChildModal;

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, User, LogOut, Users } from "lucide-react";

const Navbar: React.FC = () => {
	const [isChildrenMenuOpen, setIsChildrenMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const childrenMenuRef = useRef<HTMLDivElement | null>(null);
	const userMenuRef = useRef<HTMLDivElement | null>(null);

	const user = {
		name: "Jane",
		children: [
			{ name: "Jane", age: 10 },
			{ name: "James", age: 11 },
		],
	};

	// Close menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;

			if (
				childrenMenuRef.current &&
				!childrenMenuRef.current.contains(target)
			) {
				setIsChildrenMenuOpen(false);
			}
			if (userMenuRef.current && !userMenuRef.current.contains(target)) {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm">
			<div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-gray-200 to-transparent"></div>
			<div className="max-w-[1440px] mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Left Section - Logo & Navigation (More Left-Aligned) */}
					<div className="flex items-center space-x-8 w-1/2 pl-4">
						<Link to="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
								P
							</div>
							<span className="text-xl font-semibold text-gray-900">Popup</span>
						</Link>
						<div className="hidden md:flex space-x-6">
							<Link
								to="/courses"
								className="text-gray-600 hover:text-blue-600 transition"
							>
								Courses
							</Link>
							<Link
								to="/analytics"
								className="text-gray-600 hover:text-blue-600 transition"
							>
								Analytics
							</Link>
							<Link
								to="/history"
								className="text-gray-600 hover:text-blue-600 transition"
							>
								History
							</Link>
						</div>
					</div>

					{/* Right Section - User Profile (Shifted Right) */}
					<div className="flex items-center space-x-3 ml-auto pr-6">
						{/* Children Dropdown */}
						<div className="relative" ref={childrenMenuRef}>
							<button
								onClick={() => setIsChildrenMenuOpen(!isChildrenMenuOpen)}
								className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-1.5 hover:bg-gray-200 transition"
							>
								<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 font-bold">
									J
								</div>
								<span className="text-gray-900 font-medium">{user.name}</span>
								<ChevronDown className="w-4 h-4 text-gray-500" />
							</button>

							{isChildrenMenuOpen && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
									<div className="px-4 py-2 text-sm text-gray-500 font-semibold">
										Switch Children
									</div>
									{user.children.map((child, index) => (
										<button
											key={index}
											className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
										>
											<p className="text-gray-900 font-medium">{child.name}</p>
											<p className="text-xs text-gray-500">Age {child.age}</p>
										</button>
									))}
								</div>
							)}
						</div>

						{/* User Account Dropdown */}
						<div className="relative" ref={userMenuRef}>
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className="p-2 hover:bg-gray-100 rounded-full transition"
							>
								<User className="w-6 h-6 text-gray-600" />
							</button>

							{isUserMenuOpen && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
									<div className="px-4 py-2 text-sm text-gray-500 font-semibold">
										My Account
									</div>
									<Link
										to="/profile"
										className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
									>
										<User className="w-4 h-4" />
										Profile
									</Link>
									<Link
										to="/manage-children"
										className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
									>
										<Users className="w-4 h-4" />
										Manage Children
									</Link>
									<Link
										to="/logout"
										className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 transition"
									>
										<LogOut className="w-4 h-4" />
										Log out
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;

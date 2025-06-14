import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, Users, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useChildrenList } from "../hooks/useChildrenList";
import { DetailedChild } from "../types/UserTypes";

const Navbar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, logout, isAdmin } = useAuth();
	const { activeChild, childrenList, setActiveChild } = useChildrenList();

	// For children & user dropdown
	const [isChildrenMenuOpen, setIsChildrenMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const childrenMenuRef = useRef<HTMLDivElement | null>(null);
	const userMenuRef = useRef<HTMLDivElement | null>(null);

	// For mobile main nav (hamburger)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// ================ Key Fix: auto-set the first child as active if none ================
	useEffect(() => {
		// If we have a children list and no active child set yet, set the first child
		if (childrenList && childrenList.length > 0 && !activeChild) {
			setActiveChild(childrenList[0]);
		}
	}, [childrenList, setActiveChild]);

	// Close dropdowns if clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			// children
			if (
				childrenMenuRef.current &&
				!childrenMenuRef.current.contains(target)
			) {
				setIsChildrenMenuOpen(false);
			}
			// user
			if (userMenuRef.current && !userMenuRef.current.contains(target)) {
				setIsUserMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSwitchChild = (child: DetailedChild) => {
		setActiveChild(child);
		setIsChildrenMenuOpen(false);
		navigate("/");
	};

	const handleLogout = () => {
		setActiveChild(null);
		logout();
		navigate("/", { replace: true });
		setIsChildrenMenuOpen(false);
		setIsUserMenuOpen(false);
		toast.success("Logged out successfully!", {
			position: "top-right",
			autoClose: 1000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	};

	// Hide navbar on login/signup
	if (location.pathname === "/login" || location.pathname === "/signup") {
		return null;
	}

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm">
			<div className="max-w-[1440px] mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Left Section - Logo */}
					<div className="flex items-center space-x-4">
						<Link to="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
								P
							</div>
							<span className="text-xl font-semibold text-gray-900">Popup</span>
						</Link>
						<div className="hidden md:flex space-x-6">
							<Link
								to="/courses"
								className={`text-gray-600 hover:text-blue-600 transition ${location.pathname === "/courses" ? "font-bold" : ""
									}`}
							>
								Courses
							</Link>
							{isAuthenticated && (
								<>
									<Link
										to="/analytics"
										className={`text-gray-600 hover:text-blue-600 transition ${location.pathname === "/analytics" ? "font-bold" : ""
											}`}
									>
										Analytics
									</Link>
									<Link
										to="/history"
										className={`text-gray-600 hover:text-blue-600 transition ${location.pathname === "/history" ? "font-bold" : ""
											}`}
									>
										History
									</Link>
									{isAdmin && (
										<Link
											to="/admin"
											className={`text-gray-600 hover:text-blue-600 transition ${location.pathname === "/admin" ? "font-bold" : ""
												}`}
										>
											Admin
										</Link>
									)}
								</>
							)}
						</div>
					</div>

					{/* Right Section:
              Keep child & user menus visible on mobile. */}
					{isAuthenticated ? (
						<div className="flex items-center space-x-3 ml-auto md:pr-6">
							{/* Children Dropdown */}
							<div className="relative" ref={childrenMenuRef}>
								{childrenList && childrenList.length > 0 ? (
									<button
										onClick={() => setIsChildrenMenuOpen(!isChildrenMenuOpen)}
										className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-1.5 hover:bg-gray-200 transition"
										disabled={childrenList.length === 1}
									>
										<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 font-bold">
											{activeChild?.child_name.charAt(0).toUpperCase()}
										</div>
										<span className="text-gray-900 font-medium">
											{activeChild?.child_name}
										</span>
										{childrenList.length > 1 && (
											<ChevronDown className="w-4 h-4 text-gray-500" />
										)}
									</button>
								) : (
									// If no child or the list is empty, show Add Child
									<button
										onClick={() => navigate("/manage-children")}
										className="flex items-center space-x-2 bg-yellow-400 rounded-full px-4 py-1.5 hover:bg-yellow-200 transition"
									>
										<span className="text-white font-medium">Add Child</span>
									</button>
								)}

								{isChildrenMenuOpen &&
									childrenList &&
									childrenList.length > 1 && (
										<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
											<div className="px-4 py-2 text-sm text-gray-500 font-semibold">
												Switch Children
											</div>
											{childrenList
												.filter(
													(child) => child.child_id !== activeChild?.child_id
												)
												.map((child, index) => (
													<button
														key={index}
														className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
														onClick={() => handleSwitchChild(child)}
													>
														<p className="text-gray-900 font-medium">
															{child.child_name}
														</p>
														<p className="text-xs text-gray-500">
															Age {child.age}
														</p>
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
											onClick={() => setIsUserMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
										>
											<User className="w-4 h-4" />
											Profile
										</Link>
										<Link
											to="/manage-children"
											onClick={() => setIsUserMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
										>
											<Users className="w-4 h-4" />
											Manage Children
										</Link>
										<p
											className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 transition cursor-pointer"
											onClick={handleLogout}
										>
											<LogOut className="w-4 h-4" />
											Log out
										</p>
									</div>
								)}
							</div>
						</div>
					) : (
						// If not authenticated
						<div className="flex items-center gap-4 ml-auto pr-6">
							<button
								className="md:inline-flex hidden py-2 px-4 justify-center items-center text-sm font-medium rounded-lg border border-transparent bg-[#f1c40e] text-white hover:bg-[#e7c53b] focus:outline-none"
								onClick={() => {
									navigate("/signup");
								}}
							>
								Register
							</button>
							<button
								className="py-2 px-4 inline-flex justify-center items-center text-sm font-medium rounded-lg border border-transparent bg-[#f1c40e] text-white hover:bg-[#e7c53b] focus:outline-none"
								onClick={() => {
									navigate("/login");
								}}
							>
								Login
							</button>
						</div>
					)}

					{/* Hamburger for main nav (Courses etc.) - shown only on mobile */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
						>
							<Menu className="w-6 h-6 text-gray-600" />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile main menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden bg-white border-t border-gray-200 shadow-sm p-4 space-y-2">
					<Link
						to="/courses"
						className="block text-gray-600 hover:text-blue-600 transition"
						onClick={() => setIsMobileMenuOpen(false)}
					>
						Courses
					</Link>
					{isAuthenticated && (
						<>
							<Link
								to="/analytics"
								className="block text-gray-600 hover:text-blue-600 transition"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Analytics
							</Link>
							<Link
								to="/history"
								className="block text-gray-600 hover:text-blue-600 transition"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								History
							</Link>
							{isAdmin && (
								<Link
									to="/admin"
									className="block text-gray-600 hover:text-blue-600 transition"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Admin
								</Link>
							)}
						</>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;

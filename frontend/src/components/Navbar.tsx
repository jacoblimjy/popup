import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useChildrenList } from "../hooks/useChildrenList";
import { DetailedChild } from "../types/UserTypes";

const Navbar: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, logout } = useAuth();
	const { activeChild, childrenList, setActiveChild } = useChildrenList();
	const [isChildrenMenuOpen, setIsChildrenMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const childrenMenuRef = useRef<HTMLDivElement | null>(null);
	const userMenuRef = useRef<HTMLDivElement | null>(null);

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

	const handleSwitchChild = (child: DetailedChild) => {
		setActiveChild(child);
		setIsChildrenMenuOpen(false);
		navigate("/")
	}

	const handleLogout = () => {
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

	}

	if (location.pathname === "/login" || location.pathname === "/signup") {
		return null;
	}

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm">
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
							{isAuthenticated &&
								<>
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
								</>}
						</div>
					</div>


					{isAuthenticated ?
						<div className="flex items-center space-x-3 ml-auto pr-6"> {/* Right Section - User Profile (Shifted Right) */}
							{/* Children Dropdown */}
							<div className="relative" ref={childrenMenuRef}>
								{
									(!childrenList || childrenList.length >= 1) ?
										<button
											onClick={() => setIsChildrenMenuOpen(!isChildrenMenuOpen)}
											className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-1.5 hover:bg-gray-200 transition"
											disabled={childrenList?.length === 1}
										>
											<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 font-bold">
												{activeChild?.child_name.charAt(0).toUpperCase()}
											</div>
											<span className="text-gray-900 font-medium">{activeChild?.child_name}</span>
											{(childrenList && childrenList.length > 1) && <ChevronDown className="w-4 h-4 text-gray-500" />}
										</button>
										:
										<button
											onClick={() => navigate("/manage-children")}
											className="flex items-center space-x-2 bg-yellow-400 rounded-full px-4 py-1.5 hover:bg-yellow-200 transition"
										>
											<span className="text-white font-medium">Add Child</span>
											{(childrenList && childrenList.length > 1) && <ChevronDown className="w-4 h-4 text-gray-500" />}
										</button>
								}

								{isChildrenMenuOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
										<div className="px-4 py-2 text-sm text-gray-500 font-semibold">
											Switch Children
										</div>
										{(childrenList && childrenList?.length > 0) && childrenList.filter((child) => child.child_id !== activeChild?.child_id).map((child, index) => (
											<button
												key={index}
												className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
												onClick={() => handleSwitchChild(child)}
											>
												<p className="text-gray-900 font-medium">{child.child_name}</p>
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
						:
						<div className="flex gap-4">
							<button
								className="py-2 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-[#f1c40e] text-white hover:bg-[#e7c53b] focus:outline-none focus:bg-[#e7c53b] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
								onClick={() => { navigate("/signup") }}
							>
								Register
							</button>
							<button
								className="py-2 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-[#f1c40e] text-white hover:bg-[#e7c53b] focus:outline-none focus:bg-[#e7c53b] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
								onClick={() => { navigate("/login") }}
							>
								Login
							</button>
						</div>}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;

import { ReactNode, useEffect, useState } from "react";
import { User } from "../types/UserTypes";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { setSessionTimeoutHandler } from "../utils";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// If user is stored in localStorage, restore it
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setIsAuthenticated(true);
			setIsAdmin(JSON.parse(storedUser).role_id === 1);
			setUser(JSON.parse(storedUser));
		}
		setIsLoading(false);
		setSessionTimeoutHandler(handleSessionTimeout);
	}, []);

	const login = (user: User) => {
		setIsAuthenticated(true);
		setUser(user);
		setIsAdmin(user.role_id === 1);
		localStorage.setItem("user", JSON.stringify(user));
	};

	const logout = () => {
		setIsAuthenticated(false);
		setIsAdmin(false);
		setUser(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	const handleSessionTimeout = () => {
		if (confirm("Session timed out. Please login again.")) {
			navigate("/login");
			logout();
		};
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout, user, isAdmin, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

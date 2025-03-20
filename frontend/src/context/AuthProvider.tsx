import { ReactNode, useEffect, useState } from "react";
import { User } from "../types/UserTypes";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { setSessionTimeoutHandler } from "../utils";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		// If user is stored in localStorage, restore it
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setIsAuthenticated(true);
			setUser(JSON.parse(storedUser));
		}
		setSessionTimeoutHandler(handleSessionTimeout);
	}, []);

	const login = (user: User) => {
		setIsAuthenticated(true);
		setUser(user);
		localStorage.setItem("user", JSON.stringify(user));
	};

	const logout = () => {
		setIsAuthenticated(false);
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
		<AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
			{children}
		</AuthContext.Provider>
	);
};

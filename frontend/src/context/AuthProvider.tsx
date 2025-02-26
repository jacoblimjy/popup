import { ReactNode, useEffect, useState } from "react";
import { User } from "../types/UserTypes";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (localStorage.getItem('user')) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem('user')!));
    }
  },[]);

  const login = (user : User) => { 
    setIsAuthenticated(true);
    setUser(user);
  };
  const logout = () => { 
    setIsAuthenticated(false)
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
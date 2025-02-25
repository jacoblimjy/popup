import { createContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/UserTypes';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user : User) => void;
  logout: () => void;
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
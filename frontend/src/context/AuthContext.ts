import { createContext } from 'react';
import { User } from '../types/UserTypes';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (user : User) => void;
  logout: () => void;
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
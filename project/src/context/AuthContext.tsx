import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

interface PortfolioStock {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface User {
  name: string;
  email: string;
  portfolio?: PortfolioStock[];
  joinedDate: string;
}

interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    await fetchUserProfile();
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await API.post<LoginResponse>('/auth/signup', { name, email, password });
    localStorage.setItem('token', res.data.token);
    await fetchUserProfile();
  };

  const fetchUserProfile = async () => {
    try {
      const res = await API.get<User>('/dashboard/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token'); // clear invalid token
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

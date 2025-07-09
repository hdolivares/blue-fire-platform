'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean; // We add a loading state
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state

  useEffect(() => {
    // This effect runs once when the app loads
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({ _id: payload.sub, email: payload.email, roles: payload.roles });
      } catch (e) {
        console.error("Failed to decode token on load", e);
        localStorage.removeItem('authToken'); // Clear invalid token
      }
    }
    setLoading(false); // Finished loading
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ _id: payload.sub, email: payload.email, roles: payload.roles });
      localStorage.setItem('authToken', newToken);
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
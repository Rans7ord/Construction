'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getStoredState, saveState } from './store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage
    const state = getStoredState();
    setUser(state.currentUser);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // Demo users for testing
    const demoUsers: Record<string, User> = {
      'admin@buildmanager.com': {
        id: 'user1',
        name: 'John Admin',
        email: 'admin@buildmanager.com',
        role: 'admin',
        companyId: 'company1',
      },
      'supervisor@buildmanager.com': {
        id: 'user2',
        name: 'Jane Supervisor',
        email: 'supervisor@buildmanager.com',
        role: 'supervisor',
        companyId: 'company1',
      },
      'staff@buildmanager.com': {
        id: 'user3',
        name: 'Bob Staff',
        email: 'staff@buildmanager.com',
        role: 'staff',
        companyId: 'company1',
      },
    };

    const foundUser = demoUsers[email];
    if (foundUser && password === 'password') {
      setUser(foundUser);
      const state = getStoredState();
      state.currentUser = foundUser;
      saveState(state);
    }
  };

  const logout = () => {
    setUser(null);
    const state = getStoredState();
    state.currentUser = null;
    saveState(state);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
